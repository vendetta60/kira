#!/usr/bin/env bash
# Layihə KÖKÜNDƏN işlədin (içində backend/ qovluğu olan yer).
# Test: ./run-api.sh  və ya: chmod +x run-api.sh && ./run-api.sh
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
export PYTHONPATH="$ROOT"
cd "$ROOT"
exec python3 -m uvicorn backend.main:app --host "${UVICORN_HOST:-127.0.0.1}" --port "${UVICORN_PORT:-8001}" --workers "${UVICORN_WORKERS:-1}"
