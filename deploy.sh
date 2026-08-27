#!/usr/bin/env bash
# Redeploy Kadi Moja with minimal service interruption.
# Images build while the current site stays online. Only services whose source
# changed are rebuilt and recreated; Docker reuses dependency layers when
# package-lock.json or pom.xml did not change.
#
# Usage:
#   ./deploy.sh              pull latest main, deploy changed services
#   ./deploy.sh --skip-pull  deploy whatever is currently checked out
#   ./deploy.sh --web-only   deploy only the frontend/nginx container
#   ./deploy.sh --backend-only deploy only the backend container
#   ./deploy.sh --all        deploy both backend and web
#   ./deploy.sh --skip-build recreate changed services from prebuilt images
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")"

SKIP_PULL=false
SKIP_BUILD=false
TARGET=auto
STATE_FILE=.deploy-state
for arg in "$@"; do
  case "$arg" in
    --skip-pull) SKIP_PULL=true ;;
    --skip-build) SKIP_BUILD=true ;;
    --web-only) TARGET=web ;;
    --backend-only) TARGET=backend ;;
    --all) TARGET=all ;;
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

source_hash() {
  local service_dir=$1
  {
    tar \
      --sort=name \
      --mtime='UTC 1970-01-01' \
      --owner=0 \
      --group=0 \
      --numeric-owner \
      --exclude='frontend/node_modules' \
      --exclude='frontend/dist' \
      --exclude='frontend/.vite' \
      --exclude='frontend/.env' \
      --exclude='frontend/.env.local' \
      --exclude='backend/target' \
      --exclude='backend/uploads' \
      --exclude='backend/.env' \
      -cf - "$service_dir" docker-compose.yml

    # Compose build arguments and runtime settings can come from these files.
    [ ! -f .env ] || sha256sum .env
    if [ "$service_dir" = backend ] && [ -f backend/.env ]; then
      sha256sum backend/.env
    fi
  } | sha256sum | awk '{print $1}'
}

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

WEB_HASH=$(source_hash frontend)
BACKEND_HASH=$(source_hash backend)
OLD_WEB_HASH=
OLD_BACKEND_HASH=

if [ -f "$STATE_FILE" ]; then
  OLD_WEB_HASH=$(awk -F= '$1 == "WEB_HASH" { print $2 }' "$STATE_FILE")
  OLD_BACKEND_HASH=$(awk -F= '$1 == "BACKEND_HASH" { print $2 }' "$STATE_FILE")
fi

DEPLOY_WEB=false
DEPLOY_BACKEND=false

case "$TARGET" in
  web) DEPLOY_WEB=true ;;
  backend) DEPLOY_BACKEND=true ;;
  all)
    DEPLOY_WEB=true
    DEPLOY_BACKEND=true
    ;;
  auto)
    [ "$WEB_HASH" = "$OLD_WEB_HASH" ] || DEPLOY_WEB=true
    [ "$BACKEND_HASH" = "$OLD_BACKEND_HASH" ] || DEPLOY_BACKEND=true
    ;;
esac

SERVICES=()
[ "$DEPLOY_BACKEND" = false ] || SERVICES+=(backend)
[ "$DEPLOY_WEB" = false ] || SERVICES+=(web)

if [ "${#SERVICES[@]}" -eq 0 ]; then
  log "No backend or frontend changes detected. Nothing to deploy."
  exit 0
fi

log "Services selected: ${SERVICES[*]}"

if [ "$SKIP_BUILD" = false ]; then
  log "Building selected images while the current site remains online..."
  docker compose build "${SERVICES[@]}"
else
  log "Skipping build (--skip-build)."
fi

if [ "$DEPLOY_BACKEND" = true ]; then
  log "Updating backend container..."
  docker compose up -d --no-deps backend

  log "Waiting for backend to boot..."
  BACKEND_READY=false
  for _ in $(seq 1 40); do
    if docker compose logs backend 2>&1 | grep -q "Started BusinessCardApplication"; then
      BACKEND_READY=true
      log "Backend is up."
      break
    fi
    sleep 3
  done
  if [ "$BACKEND_READY" = false ]; then
    echo "Backend did not become ready within 120 seconds." >&2
    exit 1
  fi
fi

if [ "$DEPLOY_WEB" = true ]; then
  log "Updating web container..."
  docker compose up -d --no-deps web
fi

log "Checking https://kadimoja.com/ ..."
code=000
for _ in $(seq 1 15); do
  code=$(curl -sk -o /dev/null -w "%{http_code}" https://kadimoja.com/ || true)
  code=${code:-000}
  [ "$code" != "200" ] || break
  sleep 2
done
if [ "$code" != "200" ]; then
  echo "Site check failed (HTTP $code). Check: docker logs business-card-backend-1 / business-card-web-1" >&2
  exit 1
fi

if [ "$DEPLOY_WEB" = true ]; then
  OLD_WEB_HASH=$WEB_HASH
fi
if [ "$DEPLOY_BACKEND" = true ]; then
  OLD_BACKEND_HASH=$BACKEND_HASH
fi
{
  echo "WEB_HASH=$OLD_WEB_HASH"
  echo "BACKEND_HASH=$OLD_BACKEND_HASH"
} > "$STATE_FILE"

log "Deploy complete — https://kadimoja.com/ is responding 200."
docker compose ps
