#!/usr/bin/env node
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(import.meta.dirname, "../..");
const requireFromApi = createRequire(path.join(repoRoot, "services/bright_os_api/package.json"));
const Database = requireFromApi("better-sqlite3");
if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  console.log(resolveAppVersion({
    root: args.root,
    environment: args.environment,
    db: args.db,
    prodWebVersionJson: args["prod-web-version-json"],
    nextApk: args["next-apk"] === "true",
    targetBranch: args["target-branch"],
    targetCommit: args["target-commit"],
  }));
}

export function resolveAppVersion({
  root = process.env.BRIGHT_OS_ROOT || path.resolve(import.meta.dirname, "../.."),
  environment = process.env.NEXT_PUBLIC_BRIGHT_OS_ENVIRONMENT || "",
  db = "",
  prodWebVersionJson = "",
  explicit = process.env.BRIGHT_OS_APP_VERSION || "",
  nextApk = false,
  targetBranch = "",
  targetCommit = "",
} = {}) {
  if (explicit) return validVersion(explicit);

  if (environment === "prod" && db) {
    const ledgerVersion = latestProductionVersion(db, { nextApk, targetBranch, targetCommit });
    if (ledgerVersion) return validVersion(ledgerVersion);
  }

  if (environment !== "prod" && prodWebVersionJson && fs.existsSync(prodWebVersionJson)) {
    return validVersion(readVersionJson(prodWebVersionJson));
  }

  return validVersion(readVersionJson(path.join(root, "apps/bright_os_app/public/version.json")));
}

function validVersion(version) {
  if (!/^\d+\.\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid Bright OS X.Y.Z.S version: ${version}`);
  return version;
}

function latestProductionVersion(dbPath, { nextApk = false, targetBranch = "", targetCommit = "" } = {}) {
  const db = new Database(dbPath, { readonly: true, fileMustExist: true });
  try {
    const row = db
      .prepare(`
        SELECT
          COALESCE(MAX(CASE WHEN version_type_id = 'canon' THEN version END), 0) AS canon,
          COALESCE(MAX(CASE WHEN version_type_id = 'release' THEN version END), 0) AS release,
          COALESCE(MAX(CASE WHEN version_type_id = 'build' THEN version END), 0) AS build,
          COALESCE(MAX(CASE WHEN version_type_id = 'apk' THEN version END), 0) AS apk
        FROM build_versions
      `)
      .get();
    let apk = Number(row?.apk || 0);
    if (nextApk) {
      const existing = targetCommit
        ? db
          .prepare(`
            SELECT version
            FROM build_version_refs
            WHERE version_type_id = 'apk'
              AND target_branch = ?
              AND target_commit = ?
            ORDER BY version DESC
            LIMIT 1
          `)
          .get(targetBranch || "", targetCommit)
        : null;
      apk = existing?.version ?? apk + 1;
    }
    if (!row?.build || !apk) return "";
    return `${row.canon}.${row.release}.${row.build}.${apk}`;
  } finally {
    db.close();
  }
}

function readVersionJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8")).version || "";
}

function parseArgs(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 2) {
    const key = values[index];
    if (!key?.startsWith("--")) throw new Error(`invalid argument: ${key}`);
    parsed[key.slice(2)] = values[index + 1] ?? "";
  }
  return parsed;
}
