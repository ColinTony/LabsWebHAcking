#!/usr/bin/env bash
set -e
rm -f scoreboard/data/progress.json
docker compose up -d --build scoreboard
