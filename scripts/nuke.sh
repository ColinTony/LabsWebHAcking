#!/usr/bin/env bash
set -e
docker compose down --remove-orphans || true
docker system prune -af --volumes
