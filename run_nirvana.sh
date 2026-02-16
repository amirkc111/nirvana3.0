#!/usr/bin/env bash

set -euo pipefail

# Resolve project directory (location of this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Configurable port; defaults to 3001 to avoid conflicts with other services
PORT="${PORT:-3001}"
# Mode: production (default) removes dev overlays; set MODE=dev to run next dev
MODE="${MODE:-production}"

echo "[nirvana3.0] Starting frontend on port ${PORT} (mode: ${MODE})..."

# Move to frontend app directory
cd "${SCRIPT_DIR}/frontend"

# Ensure Node.js toolchain is available
if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm is not installed or not in PATH." >&2
  exit 1
fi

# Install dependencies if missing
if [ ! -d node_modules ]; then
  echo "[nirvana3.0] Installing node modules (first run)..."
  if [ "${MODE}" = "production" ] || [ "${NODE_ENV:-}" = "production" ]; then
    npm install --omit=dev
  else
    npm install
  fi
fi

if [ "${MODE}" = "production" ] || [ "${NODE_ENV:-}" = "production" ]; then
  export NODE_ENV=production
  # Build if no build artifacts or when FORCE_BUILD=1
  if [ ! -d .next ] || [ "${FORCE_BUILD:-0}" = "1" ]; then
    echo "[nirvana3.0] Building production bundle..."
    npm run build
  fi
  echo "[nirvana3.0] Starting production server..."
  exec npm run start -- --port "${PORT}"
else
  # Development mode
  exec npm run dev -- --port "${PORT}"
fi


