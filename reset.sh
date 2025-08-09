#!/usr/bin/env bash
set -euo pipefail
echo "[*] Stopping containers..."
docker compose down || true
echo "[*] Removing MariaDB volume if present..."
VOL=$(docker volume ls -q | grep dvwa_db || true)
if [[ -n "$VOL" ]]; then docker volume rm "$VOL" || true; fi
echo "[*] Rebuilding and starting..."
docker compose up -d --build
echo "[*] Done."
