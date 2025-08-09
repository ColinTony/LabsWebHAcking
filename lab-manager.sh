#!/bin/bash
set -e

echo "======================================="
echo " HTB Easy Lab - Gestor de Contenedores "
echo "======================================="
echo "1) Parar contenedores"
echo "2) Limpiar TODO (contenedores, volúmenes, imágenes NO usadas)"
echo "3) Reiniciar (down + up --build)"
read -p "Elige una opción [1-3]: " opt

case "$opt" in
  1)
    echo "[*] Parando contenedores..."
    docker compose down
    echo "[+] Contenedores detenidos."
    ;;
  2)
    read -p "⚠ Esto borrará contenedores, volúmenes del lab e imágenes no usadas. ¿Continuar? (y/N): " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
      echo "[*] Limpiando..."
      docker compose down --volumes --remove-orphans
      docker image prune -f
      echo "[+] Limpieza completa."
    else
      echo "[!] Operación cancelada."
    fi
    ;;
  3)
    echo "[*] Reiniciando el lab (esto puede tardar)..."
    docker compose down || true
    docker compose up -d --build
    echo "[+] Lab reiniciado."
    ;;
  *)
    echo "[!] Opción inválida."
    ;;
esac
