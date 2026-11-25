#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

mkdir -p "$SCRIPT_DIR/op" "$SCRIPT_DIR/tcp-ip-protokoly" "$SCRIPT_DIR/op4-basics"

rsync -a --delete \
  --exclude 'server.mjs' \
  --exclude '.DS_Store' \
  --exclude '.git' \
  "$ROOT_DIR/OP4/" "$SCRIPT_DIR/op/"

rsync -a --delete \
  --exclude 'server.mjs' \
  --exclude '.DS_Store' \
  --exclude '.git' \
  "$ROOT_DIR/TCP-IP-Protokoly/" "$SCRIPT_DIR/tcp-ip-protokoly/"

# Keep lightweight redirect from legacy /op4-basics/ URL to /op/
find "$SCRIPT_DIR/op4-basics" -mindepth 1 ! -name 'index.html' -delete
cat > "$SCRIPT_DIR/op4-basics/index.html" <<'EOF'
<!DOCTYPE html>
<html lang="cs">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url=../op/" />
  <title>Přesměrování na OP</title>
  <script>window.location.replace('../op/' + (window.location.hash || ''));</script>
</head>
<body>
  <p>Kurz byl přesunut na <a href="../op/">OP • Principy počítačových sítí</a>.</p>
</body>
</html>
EOF

echo "Synced OP4 -> op/ and TCP-IP-Protokoly -> tcp-ip-protokoly/"
