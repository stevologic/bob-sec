#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  create-backup.sh [output-dir]
  create-backup.sh --dry-run
  create-backup.sh --dry-run [output-dir]

Creates a timestamped OpenClaw backup archive from the repo-tracked manifest.
The archive may contain secrets. Store it privately and do not commit it to git.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OPENCLAW_HOME="${OPENCLAW_HOME:-$HOME/.openclaw}"
INCLUDE_FILE="$SCRIPT_DIR/manifests/include-paths.txt"
EXCLUDE_FILE="$SCRIPT_DIR/manifests/exclude-globs.txt"
MODE="create"
OUTPUT_DIR="$SCRIPT_DIR/out"

if [[ $# -gt 0 ]]; then
  case "$1" in
    -h|--help)
      usage
      exit 0
      ;;
    --dry-run)
      MODE="dry-run"
      shift
      ;;
  esac
fi

if [[ $# -gt 0 ]]; then
  OUTPUT_DIR="$1"
fi

if [[ ! -d "$OPENCLAW_HOME" ]]; then
  echo "error: OPENCLAW_HOME does not exist: $OPENCLAW_HOME" >&2
  exit 1
fi

if [[ ! -f "$INCLUDE_FILE" ]]; then
  echo "error: include manifest missing: $INCLUDE_FILE" >&2
  exit 1
fi

if [[ ! -f "$EXCLUDE_FILE" ]]; then
  echo "error: exclude manifest missing: $EXCLUDE_FILE" >&2
  exit 1
fi

TMP_INCLUDE="$(mktemp)"
cleanup() {
  rm -f "$TMP_INCLUDE"
}
trap cleanup EXIT

while IFS= read -r line || [[ -n "$line" ]]; do
  [[ -z "$line" ]] && continue
  [[ "$line" =~ ^# ]] && continue
  if [[ -e "$OPENCLAW_HOME/$line" ]]; then
    printf '%s\n' "$line" >> "$TMP_INCLUDE"
  else
    printf 'warning: skipping missing path: %s\n' "$line" >&2
  fi
done < "$INCLUDE_FILE"

if [[ ! -s "$TMP_INCLUDE" ]]; then
  echo "error: no include paths resolved under $OPENCLAW_HOME" >&2
  exit 1
fi

if [[ "$MODE" == "dry-run" ]]; then
  echo "OpenClaw home: $OPENCLAW_HOME"
  echo
  echo "Include paths:"
  sed 's/^/  - /' "$TMP_INCLUDE"
  echo
  echo "Exclude patterns:"
  sed '/^#/d;/^$/d;s/^/  - /' "$EXCLUDE_FILE"
  exit 0
fi

mkdir -p "$OUTPUT_DIR"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE="$OUTPUT_DIR/openclaw-config-backup-$TIMESTAMP.tar.gz"

TAR_ARGS=(
  -czf "$ARCHIVE"
  -C "$OPENCLAW_HOME"
  --exclude-vcs
  --exclude-from "$EXCLUDE_FILE"
  -T "$TMP_INCLUDE"
)

tar "${TAR_ARGS[@]}"

echo "Created: $ARCHIVE"
echo "Warning: archive may contain secrets, keep it private."
