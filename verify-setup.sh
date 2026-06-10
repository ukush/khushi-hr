#!/usr/bin/env bash
set -euo pipefail

# verify-setup.sh
# This script performs lightweight checks to help you confirm the scaffold is ready.
# It intentionally does NOT install dependencies; it reports missing pieces and
# provides actionable hints.

echo "== Khushi HR - verify setup script =="

# 1) Node version
REQUIRED_NODE_MAJOR=18
if command -v node >/dev/null 2>&1; then
  NODE_VERSION=$(node -v)
  echo "Node found: ${NODE_VERSION}"
  # Extract major version number (v18.16.0 -> 18)
  NODE_MAJOR=$(node -v | sed 's/^v\([0-9]*\).*/\1/')
  if [ "${NODE_MAJOR}" -lt "${REQUIRED_NODE_MAJOR}" ]; then
    echo "WARNING: Node >= ${REQUIRED_NODE_MAJOR} recommended. Found ${NODE_VERSION}."
  fi
else
  echo "ERROR: node not found on PATH. Install Node.js >= ${REQUIRED_NODE_MAJOR}."
fi

# 2) Check node_modules presence for frontend and backend (indicates deps installed)
for pkg in frontend backend; do
  if [ -d "${pkg}/node_modules" ]; then
    echo "${pkg}: node_modules exists"
  else
    echo "${pkg}: node_modules NOT found. Run 'npm install' in project root to install workspace deps or 'cd ${pkg} && npm install'"
  fi
done

# 3) Docker check
if command -v docker >/dev/null 2>&1; then
  if docker info >/dev/null 2>&1; then
    echo "Docker appears to be running"
  else
    echo "Docker CLI available but daemon not running or current user can't access it. Start Docker or ensure permissions."
  fi
else
  echo "Docker not found. Install Docker if you plan to run the provided docker-compose PostgreSQL service."
fi

# 4) TypeScript compile check (noEmit). This uses npx tsc if tsc not globally available.
echo "Checking TypeScript compilation for frontend and backend (noEmit)..."
for pkg in frontend backend; do
  if [ -f "${pkg}/tsconfig.json" ]; then
    echo "- Running typecheck for ${pkg}"
    if npx -y -q tsc -p "${pkg}" --noEmit >/dev/null 2>&1; then
      echo "  ${pkg}: typecheck OK"
    else
      echo "  ${pkg}: typecheck FAILED or typescript not installed. Install deps and run 'npm --workspace ${pkg} run typecheck' to get details."
    fi
  else
    echo "- ${pkg} has no tsconfig.json, skipping typecheck"
  fi
done

echo "== verify finished =="
