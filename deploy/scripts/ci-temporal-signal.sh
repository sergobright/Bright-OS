#!/usr/bin/env bash
set -euo pipefail

SERVICE_DIR="services/bright_os_temporal"
REQUIRED="${BRIGHT_TEMPORAL_REQUIRED:-false}"

finish() {
  local code="$1"
  if [[ "$code" -ne 0 && "$REQUIRED" != "true" ]]; then
    echo "Temporal signal skipped/failed; continuing because BRIGHT_TEMPORAL_REQUIRED is not true." >&2
    exit 0
  fi
  exit "$code"
}

run() {
  need BRIGHT_DEPLOY_HOST || return 1
  need BRIGHT_DEPLOY_USER || return 1
  need BRIGHT_DEPLOY_SSH_KEY || return 1

  local ssh_port="${BRIGHT_DEPLOY_SSH_PORT:-22}"
  local local_port="${BRIGHT_TEMPORAL_LOCAL_PORT:-7233}"
  local remote_port="${BRIGHT_TEMPORAL_REMOTE_PORT:-7233}"
  local key_file
  key_file="$(mktemp "${TMPDIR:-/tmp}/bright-temporal-key.XXXXXX")"
  local tunnel_pid=""

  cleanup() {
    if [[ -n "$tunnel_pid" ]]; then
      kill "$tunnel_pid" >/dev/null 2>&1 || true
      wait "$tunnel_pid" >/dev/null 2>&1 || true
    fi
    rm -f "$key_file"
  }
  trap cleanup EXIT

  printf '%s\n' "$BRIGHT_DEPLOY_SSH_KEY" >"$key_file"
  chmod 600 "$key_file"

  ssh \
    -i "$key_file" \
    -p "$ssh_port" \
    -N \
    -L "127.0.0.1:${local_port}:127.0.0.1:${remote_port}" \
    -o ExitOnForwardFailure=yes \
    -o StrictHostKeyChecking=accept-new \
    "$BRIGHT_DEPLOY_USER@$BRIGHT_DEPLOY_HOST" &
  tunnel_pid="$!"

  for _ in {1..25}; do
    if (echo >"/dev/tcp/127.0.0.1/$local_port") >/dev/null 2>&1; then
      break
    fi
    sleep 0.2
  done

  if [[ ! -d "$SERVICE_DIR/node_modules/@temporalio/client" ]]; then
    npm --prefix "$SERVICE_DIR" ci
  fi

  TEMPORAL_ADDRESS="127.0.0.1:$local_port" npm --prefix "$SERVICE_DIR" run signal -- "$@"
}

need() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "$name is required" >&2
    return 1
  fi
}

run "$@" || finish "$?"
