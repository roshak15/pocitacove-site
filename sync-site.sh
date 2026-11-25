#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

mkdir -p "$SCRIPT_DIR/op4-basics" "$SCRIPT_DIR/tcp-ip-protokoly"

rsync -a --delete \
  --exclude 'server.mjs' \
  --exclude '.DS_Store' \
  --exclude '.git' \
  "$ROOT_DIR/OP4/" "$SCRIPT_DIR/op4-basics/"

rsync -a --delete \
  --exclude 'server.mjs' \
  --exclude '.DS_Store' \
  --exclude '.git' \
  "$ROOT_DIR/TCP-IP-Protokoly/" "$SCRIPT_DIR/tcp-ip-protokoly/"

echo "Synced OP4 -> op4-basics/ and TCP-IP-Protokoly -> tcp-ip-protokoly/"
