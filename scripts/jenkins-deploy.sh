#!/usr/bin/env bash
# Deploy the dashboard without taking it down — Jenkins "Execute shell":
#
#   sudo -E bash "${WORKSPACE}/scripts/jenkins-deploy.sh"
#
# The old job deleted node_modules and .next in the directory the live site ran from, so the site
# answered "Internal Server Error" for the whole install + build. Now:
#   1. build here, in the Jenkins workspace — the live site runs from $ROOT/current and is untouched
#   2. copy the standalone build into $ROOT/releases/<time> and try it on a spare port
#      ($PUSHIFY_FRONTEND_TEST_PORT, default 3999)
#   3. point $ROOT/current at it (one atomic rename) and let pm2 restart the two cluster
#      instances one after the other — one of them always answers
# The last $KEEP releases stay on disk; to roll back, point `current` at an older one and
# `pm2 reload <app>`.
#
# The first run takes over the pm2 app from ecosystem.config.js (same name and port, its env
# kept); that switch from the old process to the new one is the only moment without an answer.
set -euo pipefail

WORKSPACE_DIR="${WORKSPACE:-$(cd "$(dirname "$0")/.." && pwd)}"
ROOT="${PUSHIFY_FRONTEND_ROOT:-/var/www/pushify-frontend}"
KEEP="${PUSHIFY_FRONTEND_KEEP:-3}"
INSTANCES="${PUSHIFY_FRONTEND_INSTANCES:-2}"
TEST_PORT="${PUSHIFY_FRONTEND_TEST_PORT:-3999}"

cd "$WORKSPACE_DIR"
log() { echo "==> $*"; }

# App name, port and env of the running dashboard: from ecosystem.config.js when there is one.
read_app() {
  node -e '
    let app = {};
    try { app = (require(process.argv[1]).apps || [])[0] || {}; } catch {}
    const env = Object.assign({}, app.env || {}, app.env_production || {});
    process.stdout.write(JSON.stringify({ name: app.name || "pushify-frontend", port: String(env.PORT || 3000), env }));
  ' "$WORKSPACE_DIR/ecosystem.config.js"
}
APP_JSON="$(read_app)"
APP_NAME="${PUSHIFY_FRONTEND_APP:-$(node -e 'console.log(JSON.parse(process.argv[1]).name)' "$APP_JSON")}"
PORT="${PUSHIFY_FRONTEND_PORT:-$(node -e 'console.log(JSON.parse(process.argv[1]).port)' "$APP_JSON")}"
log "Dashboard: pm2 app '$APP_NAME' on port $PORT, releases in $ROOT"
# Leftovers on the test port get stopped below — it must never be the live one
if [[ "$TEST_PORT" == "$PORT" ]]; then
  echo "ERROR: PUSHIFY_FRONTEND_TEST_PORT ($TEST_PORT) is the live port — pick a spare one" >&2
  exit 1
fi

# 1. Build (NEXT_PUBLIC_* come from the .env files here and are baked in now)
if [[ -f package-lock.json ]]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi
rm -rf .next
npm run build
[[ -f .next/standalone/server.js ]] || { echo "ERROR: no .next/standalone/server.js — is output: 'standalone' set?" >&2; exit 1; }

# 2. Assemble the release: standalone server + static assets + public + runtime .env files
RELEASE="$ROOT/releases/$(date -u +%Y%m%d%H%M%S)"
mkdir -p "$RELEASE/.next"
cp -a .next/standalone/. "$RELEASE/"
cp -a .next/static "$RELEASE/.next/static"
cp -a public "$RELEASE/public"
for f in .env .env.production .env.local .env.production.local; do
  [[ -f "$f" ]] && cp -a "$f" "$RELEASE/"
done
log "Release assembled: $RELEASE"

# …and try it before anyone else does.
# Anything accepting connections on 127.0.0.1:<port>? (curl exit 7 = connection refused)
port_open() { local rc=0; curl -s -o /dev/null -m 2 "http://127.0.0.1:$1/" || rc=$?; [[ $rc -ne 7 ]]; }
# SIGTERM, then SIGKILL if it is still there after 10 s
stop_pid() {
  kill "$1" 2>/dev/null || true
  for _ in $(seq 1 10); do kill -0 "$1" 2>/dev/null || break; sleep 1; done
  kill -0 "$1" 2>/dev/null && kill -KILL "$1" 2>/dev/null || true
}
stop_smoke() {
  [[ -n "${SMOKE_PID:-}" ]] || return 0
  stop_pid "$SMOKE_PID"
  wait "$SMOKE_PID" 2>/dev/null || true
  SMOKE_PID=""
}
# A test server an earlier run left behind (before the exec fix below every run left one; a job
# killed with SIGKILL still can) runs from a release directory — pruned since, perhaps, which /proc
# shows as "<dir> (deleted)". When everything listening on the test port is such a leftover, stop
# it: a Next server with SIGTERM/SIGKILL, a pm2 app other than the live one with `pm2 delete` (pm2
# would start a killed one again). Anything else, or no way to tell, is left alone (returns 1).
stop_leftover_test_server() {
  local releases pids pid cwd app pm2_ids=() kill_pids=()
  releases="$(readlink -f "$ROOT/releases")/"
  pids="$(ss -ltnp "sport = :$TEST_PORT" 2>/dev/null | grep -o 'pid=[0-9]*' | cut -d= -f2 | sort -u)"
  [[ -n "$pids" ]] || { echo "       can't see who listens on :$TEST_PORT (ss -ltnp shows no pid)" >&2; return 1; }
  for pid in $pids; do
    cwd="$(readlink "/proc/$pid/cwd" 2>/dev/null)"
    if [[ "$cwd" != "$releases"* ]]; then
      echo "       pid $pid on :$TEST_PORT runs in ${cwd:-?}, not in a release — not ours" >&2
      return 1
    fi
    app="$(pm2 jlist 2>/dev/null | node -e '
      let d = ""; process.stdin.on("data", (c) => (d += c)).on("end", () => {
        let list = []; try { list = JSON.parse(d || "[]"); } catch {}
        const p = list.find((x) => String(x.pid) === process.argv[1]);
        process.stdout.write(p ? `${p.pm_id}|${p.name}` : "");
      });' "$pid")"
    if [[ -n "$app" ]]; then
      if [[ "${app#*|}" == "$APP_NAME" ]]; then
        echo "       pid $pid on :$TEST_PORT is the live pm2 app '$APP_NAME' — not touching it" >&2
        return 1
      fi
      pm2_ids+=("${app%%|*}")
    elif [[ "$(tr '\0' ' ' 2>/dev/null <"/proc/$pid/cmdline")" =~ ^(next-server|node\ server\.js) ]]; then
      kill_pids+=("$pid")   # the standalone server renames itself "next-server (v…)"
    else
      echo "       pid $pid on :$TEST_PORT runs in a release but is not a Next server — not touching it" >&2
      return 1
    fi
  done
  for app in "${pm2_ids[@]}"; do
    log "Deleting pm2 app $app, left on :$TEST_PORT by an earlier run"
    pm2 delete "$app" >/dev/null || return 1
  done
  for pid in "${kill_pids[@]}"; do
    log "Stopping the test server an earlier run left on :$TEST_PORT (pid $pid, $(readlink "/proc/$pid/cwd" 2>/dev/null))"
    stop_pid "$pid"
  done
}
# A server left on the test port (e.g. by an earlier run) would answer in place of the new release,
# which dies with EADDRINUSE — and a broken release would go live. A leftover of ours is stopped;
# anything else stops the deploy.
if port_open "$TEST_PORT" && stop_leftover_test_server; then
  for _ in $(seq 1 10); do port_open "$TEST_PORT" || break; sleep 1; done
fi
if port_open "$TEST_PORT"; then
  echo "ERROR: port $TEST_PORT is busy — stop whatever listens there (ss -ltnp 'sport = :$TEST_PORT'); the live site was not touched" >&2
  rm -rf "$RELEASE"
  exit 1
fi
# Set before the start: a failed step, or SIGTERM/SIGHUP from an aborted job, stops the test server
# too (with set -e every error ends in EXIT). Only SIGKILL gets past it — see above.
trap stop_smoke EXIT
# exec: $! is node itself, not a subshell around it (killing the subshell left node running)
( cd "$RELEASE" && PORT="$TEST_PORT" HOSTNAME=127.0.0.1 NODE_ENV=production exec node server.js >"$RELEASE/.smoke.log" 2>&1 ) &
SMOKE_PID=$!
ok=""
for _ in $(seq 1 30); do
  kill -0 "$SMOKE_PID" 2>/dev/null || break   # it exited: whatever answers now is not this release
  code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "http://127.0.0.1:$TEST_PORT/" || true)"
  if [[ "$code" =~ ^[23] ]]; then ok=1; break; fi
  sleep 1
done
stop_smoke
trap - EXIT
for _ in $(seq 1 5); do port_open "$TEST_PORT" || break; sleep 1; done
if port_open "$TEST_PORT"; then
  echo "ERROR: port $TEST_PORT still answers after the test server was stopped — not trusting the check; the live site was not touched" >&2
  echo "       find it: ss -ltnp 'sport = :$TEST_PORT'" >&2
  rm -rf "$RELEASE"
  exit 1
fi
if [[ -z "$ok" ]]; then
  echo "ERROR: the new release did not answer on port $TEST_PORT — the live site was not touched" >&2
  tail -30 "$RELEASE/.smoke.log" >&2 || true
  rm -rf "$RELEASE"
  exit 1
fi
log "Release answers on :$TEST_PORT"

# 3. Switch: `current` now points at the new release (rename is atomic)
ln -sfn "$RELEASE" "$ROOT/current.next"
mv -Tf "$ROOT/current.next" "$ROOT/current"

cat >"$ROOT/ecosystem.config.cjs" <<EOF
// Generated by scripts/jenkins-deploy.sh — edit the script, not this file.
module.exports = {
  apps: [{
    name: ${APP_NAME@Q},
    script: '$ROOT/current/server.js',
    cwd: '$ROOT/current',
    exec_mode: 'cluster',
    instances: $INSTANCES,
    autorestart: true,
    max_memory_restart: '1G',
    env: Object.assign($(node -e 'console.log(JSON.stringify(JSON.parse(process.argv[1]).env))' "$APP_JSON"), {
      NODE_ENV: 'production',
      PORT: '$PORT',
      // The standalone server binds to \$HOSTNAME, which shells set to the machine's name — pin it
      // (all interfaces, like \`next start\`).
      HOSTNAME: '${PUSHIFY_FRONTEND_HOST:-0.0.0.0}',
    }),
  }],
};
EOF

current_exec="$(pm2 jlist 2>/dev/null | node -e '
  let d = ""; process.stdin.on("data", (c) => (d += c)).on("end", () => {
    const p = (JSON.parse(d || "[]")).find((x) => x.name === process.argv[1]);
    process.stdout.write(p ? `${p.pm2_env.exec_mode}|${p.pm2_env.pm_exec_path}` : "");
  });' "$APP_NAME")"

if [[ "$current_exec" == "cluster_mode|$ROOT/current/server.js" ]]; then
  log "Rolling restart of '$APP_NAME'"
  pm2 reload "$ROOT/ecosystem.config.cjs" --update-env
else
  # First run (or a different setup): replace the old process — the one short gap
  log "Taking over '$APP_NAME' (was: ${current_exec:-not running})"
  pm2 delete "$APP_NAME" >/dev/null 2>&1 || true
  pm2 start "$ROOT/ecosystem.config.cjs"
fi
pm2 save

# 4. Keep the last $KEEP releases (never the live one)
live="$(readlink -f "$ROOT/current")"
ls -1dt "$ROOT"/releases/* 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  [[ "$(readlink -f "$old")" == "$live" ]] || rm -rf "$old"
done

for _ in $(seq 1 20); do
  code="$(curl -s -o /dev/null -m 5 -w '%{http_code}' "http://127.0.0.1:$PORT/" || true)"
  [[ "$code" =~ ^[23] ]] && { log "Live on :$PORT (HTTP $code) — $(basename "$RELEASE")"; exit 0; }
  sleep 1
done
echo "WARN: :$PORT is not answering yet — check: pm2 logs $APP_NAME" >&2
