#!/usr/bin/env bash
set -e

DB_NAME="clinica_db"
DB_USER="clinica_user"
DB_PASS="clinica_pass123"

echo "===================================================================="
echo "  Instalando y Configurando MySQL (MariaDB) + Redis en CT 105"
echo "===================================================================="

pct exec 105 -- bash -c "
  export DEBIAN_FRONTEND=noninteractive

  echo '==> [1/5] Actualizando e instalando MariaDB Server y Redis...'
  apt-get update -y
  apt-get install -y mariadb-server mariadb-client redis-server

  echo '==> [2/5] Configurando MySQL para permitir conexiones desde la red interna (CT 103)...'
  # Permitir conexiones remotas cambiando bind-address a 0.0.0.0
  sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf 2>/dev/null || \
  sed -i 's/^bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/my.cnf 2>/dev/null || true

  systemctl restart mariadb
  systemctl enable mariadb

  echo '==> [3/5] Creando base de datos y usuario para Prisma...'
  mariadb -u root <<EOF_SQL
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
EOF_SQL

  echo '==> [4/5] Configurando Redis Server (NoSQL) para red interna...'
  sed -i 's/^bind 127.0.0.1.*/bind 0.0.0.0/' /etc/redis/redis.conf
  sed -i 's/^protected-mode yes/protected-mode no/' /etc/redis/redis.conf
  systemctl restart redis-server
  systemctl enable redis-server

  echo '==> [5/5] Verificando puertos activos (MySQL: 3306, Redis: 6379)...'
  ss -tulpn | grep -E '3306|6379'
"

echo ""
echo "===================================================================="
echo "  BASE DE DATOS HÍBRIDA LISTA EN CT 105 (192.168.56.105)"
echo "===================================================================="
echo ""
echo "Variables de entorno para el archivo .env de Next.js (CT 103):"
echo ""
echo "DATABASE_URL=\"mysql://${DB_USER}:${DB_PASS}@192.168.56.105:3306/${DB_NAME}\""
echo "REDIS_URL=\"redis://192.168.56.105:6379\""
echo ""
echo "===================================================================="
