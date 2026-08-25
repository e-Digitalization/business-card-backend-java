#!/usr/bin/env bash
# Redeploy Kadi Moja: pull latest code, rebuild backend/web images, and
# recreate those containers. db and certbot are left untouched.
#
# Usage:
#   ./deploy.sh              pull latest main, build, recreate
#   ./deploy.sh --skip-pull  deploy whatever is currently checked out
#   ./deploy.sh --skip-build recreate containers from already-built images
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

SKIP_PULL=false
SKIP_BUILD=false
for arg in "$@"; do
  case "$arg" in
    --skip-pull) SKIP_PULL=true ;;
    --skip-build) SKIP_BUILD=true ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

log() { echo "[$(date '+%H:%M:%S')] $*"; }

if [ "$SKIP_PULL" = false ]; then
  if [ -n "$(git status --porcelain)" ]; then
    echo "Working tree has uncommitted changes — commit/stash them or run with --skip-pull." >&2
    git status --short
    exit 1
  fi
  log "Pulling latest main..."
  git pull --ff-only origin main
else
  log "Skipping git pull (--skip-pull)."
fi

if [ "$SKIP_BUILD" = false ]; then
  log "Building backend + web images..."
  docker compose build backend web
else
  log "Skipping build (--skip-build)."
fi

log "Recreating backend + web containers..."
docker compose up -d --force-recreate backend web

log "Waiting for backend to boot..."
for _ in $(seq 1 40); do
  if docker logs business-card-backend-1 2>&1 | grep -q "Started BusinessCardApplication"; then
    log "Backend is up."
    break
  fi
  sleep 3
done

log "Checking https://kadimoja.com/ ..."
code=$(curl -sk -o /dev/null -w "%{http_code}" https://kadimoja.com/ || echo "000")
if [ "$code" != "200" ]; then
  echo "Site check failed (HTTP $code). Check: docker logs business-card-backend-1 / business-card-web-1" >&2
  exit 1
fi

log "Deploy complete — https://kadimoja.com/ is responding 200."
docker compose ps
