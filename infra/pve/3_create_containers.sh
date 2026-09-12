#!/usr/bin/env bash
set -e

TMPL_FILE=$(pveam list local | grep 'debian' | awk '{print $1}' | head -n 1)

if [ -z "$TMPL_FILE" ]; then
  echo "Error: No se encontró ninguna plantilla descargada. Ejecuta primero: bash /vagrant/2_download_template.sh"
  exit 1
fi

echo "Usando plantilla: $TMPL_FILE"
echo ""

echo "==> [1/4] Creando CT 101: DNS BIND9 & DHCP (Integrante 1)..."
pct destroy 101 --purge 2>/dev/null || true
pct create 101 "$TMPL_FILE" --hostname dns-dhcp --cores 1 --memory 512 --swap 512 \
  --storage local --net0 name=eth0,bridge=vmbr0,ip=192.168.56.101/24,gw=192.168.56.1 \
  --nameserver 8.8.8.8 --password proxmox --start 1

echo "==> [2/4] Creando CT 102: Web Nginx Proxy, SSL & Frontend (Integrante 2)..."
pct destroy 102 --purge 2>/dev/null || true
pct create 102 "$TMPL_FILE" --hostname web-proxy --cores 1 --memory 1024 --swap 512 \
  --storage local --net0 name=eth0,bridge=vmbr0,ip=192.168.56.102/24,gw=192.168.56.1 \
  --nameserver 8.8.8.8 --password proxmox --start 1

echo "==> [3/4] Creando CT 103: API Backend & BD Híbrida (Integrante 3)..."
pct destroy 103 --purge 2>/dev/null || true
pct create 103 "$TMPL_FILE" --hostname backend-db --cores 2 --memory 2048 --swap 1024 \
  --storage local --net0 name=eth0,bridge=vmbr0,ip=192.168.56.103/24,gw=192.168.56.1 \
  --nameserver 8.8.8.8 --password proxmox --start 1

echo "==> [4/4] Creando CT 104: Mail Postfix SMTP & SFTP Facturas (Integrante 4)..."
pct destroy 104 --purge 2>/dev/null || true
pct create 104 "$TMPL_FILE" --hostname mail-sftp --cores 1 --memory 512 --swap 512 \
  --storage local --net0 name=eth0,bridge=vmbr0,ip=192.168.56.104/24,gw=192.168.56.1 \
  --nameserver 8.8.8.8 --password proxmox --start 1

echo ""
echo "===================================================================="
echo "  LOS 4 CONTENEDORES LXC FUERON CREADOS Y ESTÁN ACTIVOS:"
echo "===================================================================="
pct list
