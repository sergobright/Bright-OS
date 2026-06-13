## Memory Bank

- This project uses a Memory Bank in `memory-bank/`.
- Read `memory-bank/README.md` first, then the core files before making non-trivial project changes.
- Keep Memory Bank updates small and factual. Update it when project goals, architecture, active work, decisions, or verification status changes.
- Do not treat Memory Bank content as a substitute for checking the actual repository state.

## Code Search

- Use SocratiCode for semantic code search in this project after confirming the codebase index is complete.
- Use `rg` for exact string searches, file discovery, and other non-semantic repository inspection.

## OpenSpec

- This project uses OpenSpec in `openspec/` for spec-driven development.
- Accepted durable requirements, workflow rules, local services, architecture constraints, and project invariants belong in `openspec/specs/`.
- Planned requirement changes must start in `openspec/changes/<change-id>/` before implementation unless the user explicitly asks for an emergency direct edit.
- Each planned change should include `proposal.md`, spec deltas under `specs/<capability>/spec.md`, `tasks.md`, and `design.md` when the change affects architecture, data models, dependencies, security, performance, migration, or multiple modules.
- Main specs under `openspec/specs/` must use `## Purpose` and `## Requirements`; delta headers such as `## ADDED Requirements` are only for change-local specs.
- Run `npm run openspec:validate` after editing OpenSpec files.
- OpenSpec CLI is pinned as `@fission-ai/openspec` in `package.json` and requires Node.js `>=20.19.0`.
