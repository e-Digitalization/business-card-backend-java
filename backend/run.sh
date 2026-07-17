#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f .env ]]; then
  echo "Missing backend/.env — copy the template first:"
  echo "  cp .env.example .env"
  exit 1
fi

# Export KEY=VALUE from .env into the process environment (skip comments / blanks)
set -a
# shellcheck disable=SC1091
source .env
set +a

# Prefer SDKMAN Amazon Corretto 17 when available
if [[ -z "${JAVA_HOME:-}" ]]; then
  for candidate in \
    "$HOME/.sdkman/candidates/java/17.0.17-amzn" \
    "$HOME/.sdkman/candidates/java/17.0.14-amzn" \
    "$HOME/.sdkman/candidates/java/current"; do
    if [[ -x "$candidate/bin/java" ]]; then
      export JAVA_HOME="$candidate"
      break
    fi
  done
fi

if [[ -n "${JAVA_HOME:-}" ]]; then
  export PATH="$JAVA_HOME/bin:$PATH"
fi

echo "Starting Kadi Moja backend (credentials from backend/.env)…"
if [[ -n "${OPENAI_API_KEY:-}" ]]; then
  echo "  AI:     OpenAI configured"
elif [[ -n "${GEMINI_API_KEY:-}" ]]; then
  echo "  AI:     Gemini configured"
else
  echo "  AI:     not configured (local OCR only)"
fi
if [[ -n "${SELCOM_API_KEY:-}" && -n "${SELCOM_API_SECRET:-}" && -n "${SELCOM_VENDOR:-}" ]]; then
  echo "  Selcom: live checkout configured"
else
  echo "  Selcom: demo/mock checkout (fill SELCOM_* in .env for live)"
fi
exec mvn -q spring-boot:run
