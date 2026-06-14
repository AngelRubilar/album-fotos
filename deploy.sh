#!/usr/bin/env bash
# Despliegue de album-fotos como stack docker-compose autónomo.
# Actualiza el código, reconstruye la imagen y recrea los contenedores.
# Uso (en el servidor):  ./deploy.sh
set -euo pipefail
cd "$(dirname "$0")"

echo "==> git pull"
git pull

echo "==> docker compose up -d --build"
docker compose up -d --build

echo "==> estado:"
docker compose ps

echo "Deploy completo."
