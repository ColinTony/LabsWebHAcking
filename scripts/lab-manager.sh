#!/usr/bin/env bash
set -e
echo "======================================="
echo " HTB Easy Lab - Gestor de Contenedores "
echo "======================================="
echo "1) Parar contenedores"
echo "2) Limpiar TODO (contenedores, volúmenes, imágenes NO usadas)"
echo "3) Reiniciar (down + up --build)"
read -p "Elige una opción [1-3]: " opt
case "$opt" in
  1) docker compose down ;;
  2) docker compose down --remove-orphans || true
     docker volume prune -f || true
     docker image prune -af || true ;;
  3) docker compose down --remove-orphans || true
     docker compose up -d --build ;;
  *) echo "Opción inválida"; exit 1;;
esac
