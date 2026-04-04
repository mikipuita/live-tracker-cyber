#!/usr/bin/env bash
# Run backend + frontend together (development). Stop with Ctrl+C.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PY="$ROOT/backend/venv/bin/python"
if [[ ! -x "$BACKEND_PY" ]]; then
  echo "Missing backend venv. Run:"
  echo "  cd \"$ROOT/backend\" && python3 -m venv venv && ./venv/bin/pip install 'uvicorn[standard]' websockets fastapi httpx python-dotenv"
  exit 1
fi

cleanup() {
  if [[ -n "${BACK_PID:-}" ]] && kill -0 "$BACK_PID" 2>/dev/null; then
    kill "$BACK_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

echo "Starting API on http://127.0.0.1:9000 ..."
(cd "$ROOT/backend" && "$BACKEND_PY" main.py) &
BACK_PID=$!
sleep 2

echo "Starting dashboard on http://127.0.0.1:3000 ..."
(cd "$ROOT/frontend" && npm run dev) || true
cleanup
