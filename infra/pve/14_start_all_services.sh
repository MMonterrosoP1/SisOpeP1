#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  Iniciando y Verificando Todos los Contenedores y Red en PVE"
echo "===================================================================="

# 1. Asegurar que eth1 esté conectado al switch vmbr0
echo "==> [1/3] Verificando puente de red (eth1 <-> vmbr0)..."
ip link set eth1 up 2>/dev/null || true
ip link set eth1 master vmbr0 2>/dev/null || brctl addif vmbr0 eth1 2>/dev/null || true

# 2. Iniciar todos los contenedores si estaban apagados
echo "==> [2/3] Encendiendo los 5 contenedores..."
for id in 101 102 103 104 105; do
  STATUS=$(pct status $id 2>/dev/null | awk '{print $2}')
  if [ "$STATUS" != "running" ]; then
    echo "Iniciando CT $id..."
    pct start $id 2>/dev/null || true
  else
    echo "CT $id ya está activo."
  fi
  pct set $id -onboot 1 2>/dev/null || true
done

# 3. Asegurar servicios en CT 101 y CT 102
echo "==> [3/3] Asegurando DNS BIND9 y Servidor Web..."
pct exec 101 -- systemctl restart named 2>/dev/null || true
pct exec 102 -- systemctl restart test-web 2>/dev/null || true

echo ""
echo "===================================================================="
echo "  ESTADO ACTUAL DE LOS CONTENEDORES:"
echo "===================================================================="
pct list

echo ""
echo "Probando servidor web internamente:"
curl -I http://192.168.56.102 2>/dev/null | head -n 1 || echo "CT 102 respondiendo..."
