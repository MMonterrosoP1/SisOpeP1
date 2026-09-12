#!/usr/bin/env bash
set -e

pct exec 105 -- bash -c '
# 1. Terminar procesos huérfanos de mariadbd manuales que retienen los locks de los archivos
killall -9 mariadbd mysqld 2>/dev/null || true
sleep 2

# 2. Configurar override de systemd para evitar error 226/NAMESPACE en LXC
mkdir -p /etc/systemd/system/mariadb.service.d
cat <<EOF > /etc/systemd/system/mariadb.service.d/override.conf
[Service]
ProtectSystem=false
ProtectHome=false
ProtectControlGroups=false
EOF

# 3. Asegurar bind-address = 0.0.0.0
sed -i "s/^bind-address.*/bind-address = 0.0.0.0/" /etc/mysql/mariadb.conf.d/50-server.cnf 2>/dev/null || true

# 4. Iniciar servicio limpio mediante systemd
systemctl daemon-reload
systemctl restart mariadb
systemctl is-active mariadb
'

echo ""
echo "=== PUERTOS ACTIVOS EN CT 105 ==="
pct exec 105 -- ss -tulpn | grep 3306

echo ""
echo "=== TEST DE CONEXION DESDE CT 103 (API) ==="
pct exec 103 -- nc -zv 192.168.56.105 3306 2>&1

echo ""
echo "=== TEST DE LOGIN REMOTO CON USUARIO ADMIN ==="
pct exec 103 -- mariadb -u admin -p1234 -h 192.168.56.105 -e "SHOW DATABASES; USE clinica; SHOW TABLES;" 2>&1 || true
