# Temporal CI/CD Orchestration

Bright OS uses self-host Temporal as a durable CI/CD state tracker for branch previews and promotions. The first integration phase is reporting-first: GitHub Actions still runs the existing checks and deploy scripts, and Temporal records state by best-effort signals.

## Terms

- Temporal address: `127.0.0.1:7233` on the VPS. It is not exposed publicly.
- Worker service: `brightos-temporal-worker.service`.
- Preview task queue: `bright-os-preview`.
- Promotion task queue: `bright-os-promotion`.
- Preview workflow ID: `bright-os:preview:<branch>`.
- Promotion workflow ID: `bright-os:promotion:<target>:<sha>`.
- State query name: `state`.
- Signal name: `event`.

## Preview Slot Lease Lifecycle

Preview slots are still allocated and released by the existing slot scripts:

1. A `codex/*` push starts or signals `BranchPreviewWorkflow`.
2. GitHub Actions signals `branch_pushed` and `checks_started`.
3. Existing `checks` job runs unchanged.
4. GitHub Actions signals `checks_passed` or `checks_failed`.
5. Existing `deploy-preview` runs `deploy/scripts/ci-ssh-deploy.sh`.
6. GitHub Actions signals `preview_deploy_passed` or `preview_deploy_failed`.
7. A failed check or preview deploy leaves workflow state at `waiting_for_fix`.
8. Accepted preview completion signals `pr_merged` and `slot_released`.
9. Manual or delete-triggered release signals `slot_released` or `release_failed`.

The preview slot registry remains `/srv/projects/bright-os-envs/preview-slots.json`; Temporal does not replace that lock or registry in this phase.

## BranchPreviewWorkflow

`BranchPreviewWorkflow` keeps a bounded event log and the current state for a `codex/*` branch:

- `branch_pushed`
- `checks_started`, `checks_passed`, `checks_failed`
- `preview_deploy_started`, `preview_deploy_passed`, `preview_deploy_failed`
- `pr_merged`
- `slot_released`, `released`, `branch_deleted`

`checks_failed` and `preview_deploy_failed` both set `status` to `waiting_for_fix`, so a broken deploy is retained in Temporal UI instead of disappearing into a failed CI log.

## PromotionWorkflow

`PromotionWorkflow` tracks accepted preview to `dev`, and `dev` to production:

- Workflow ID for dev deploy: `bright-os:promotion:dev:<sha>`.
- Workflow ID for production deploy: `bright-os:promotion:prod:<sha>`.
- Signals: `dev_deploy_started`, `dev_deploy_passed`, `dev_deploy_failed`, `prod_deploy_started`, `prod_deploy_passed`, `prod_deploy_failed`.

Promotion deploy logic still lives in the existing scripts. Temporal is not the authority for merging, branch protection, ledger writes, or production deployment.

## Worker Permissions

The worker unit runs as `bright-os` with supplementary `bright-deploy` group and connects to local Temporal only:

```bash
sudo systemctl enable --now brightos-temporal-worker.service
sudo systemctl status brightos-temporal-worker.service
```

Install dependencies before enabling the unit:

```bash
npm --prefix /srv/projects/bright-os/services/bright_os_temporal ci
```

The unit does not include GitHub tokens, SSH keys, Caddy credentials, database passwords, or Supabase secrets. If later worker activities need production-grade GitHub or deploy actions, store them outside Git, for example:

```text
/etc/bright-os/brightos-temporal-worker.env
BRIGHT_TEMPORAL_GITHUB_TOKEN
BRIGHT_TEMPORAL_DEPLOY_SSH_KEY_PATH
```

Do not add those values to repository docs.

## GitHub Actions Signals

GitHub Actions uses `deploy/scripts/ci-temporal-signal.sh`. The helper opens an SSH tunnel to `127.0.0.1:7233` through the existing deploy SSH boundary, runs the local Temporal client, then closes the tunnel. It does not open Temporal or Postgres ports externally.

By default the helper is best-effort: if Temporal, SSH tunnel setup, or the client call fails, it exits successfully and logs the skipped signal. Set `BRIGHT_TEMPORAL_REQUIRED=true` only for a dedicated Temporal check or manual strict run.

## Manual Smoke Test

Start the worker:

```bash
TEMPORAL_ADDRESS=127.0.0.1:7233 npm --prefix services/bright_os_temporal start
```

Start a fake preview workflow:

```bash
TEMPORAL_ADDRESS=127.0.0.1:7233 npm --prefix services/bright_os_temporal run signal -- demo --branch codex/temporal-smoke
```

Query state:

```bash
TEMPORAL_ADDRESS=127.0.0.1:7233 npm --prefix services/bright_os_temporal run signal -- query-preview --branch codex/temporal-smoke
```

Then open `https://temporal.brightos.world` with the unified Caddy basic auth and look for workflow ID `bright-os:preview:codex/temporal-smoke`.

## Failure And Manual Recovery

- Temporal unavailable: CI/deploy continues; rerun the failed signal command later if state must be backfilled.
- Worker stopped: workflows remain in Temporal; restart `brightos-temporal-worker.service`.
- Failed preview deploy: query the workflow state and inspect the `waiting_for_fix` event, then fix and push the same `codex/*` branch.
- Stuck slot release: use `deploy/scripts/preview-slots.sh status` on the VPS source checkout, then rerun the existing release workflow or `deploy/scripts/ci-ssh-release-slot.sh`.
- Wrong or sensitive event data: do not mutate Temporal history. Start a new corrected workflow only if the old history contains no secrets; if a secret was signaled, rotate it and treat the Temporal DB as exposed for that secret.
