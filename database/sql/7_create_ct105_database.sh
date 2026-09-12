#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  Creando CT 105: Base de Datos Híbrida Dedicada (SQL + Redis)"
echo "===================================================================="

TMPL_FILE=$(pveam list local | grep 'debian' | awk '{print $1}' | head -n 1)

if [ -z "$TMPL_FILE" ]; then
  echo "Error: No se encontró plantilla Debian descargada."
  exit 1
fi

echo "==> [1/3] Creando y encendiendo CT 105 (192.168.56.105)..."
pct destroy 105 --purge 2>/dev/null || true
pct create 105 "$TMPL_FILE" --hostname database-hybrid --cores 1 --memory 1536 --swap 512 \
  --storage local --net0 name=eth0,bridge=vmbr0,ip=192.168.56.105/24,gw=192.168.56.1 \
  --nameserver 8.8.8.8 --password proxmox --start 1

echo "==> [2/3] Habilitando acceso SSH con contraseña 'proxmox' en CT 105..."
pct exec 105 -- bash -c "
  sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
  sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
  mkdir -p /etc/ssh/sshd_config.d
  echo 'PermitRootLogin yes' > /etc/ssh/sshd_config.d/root-login.conf
  echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config.d/root-login.conf
  echo 'root:proxmox' | chpasswd
  systemctl restart ssh || systemctl restart sshd
"

echo "==> [3/3] Ajustando memoria de CT 103 (Ahora solo API Backend)..."
pct set 103 --hostname backend-api --memory 1024 2>/dev/null || true

echo ""
echo "===================================================================="
echo "  ARQUITECTURA ACTUALIZADA A 5 CONTENEDORES:"
echo "===================================================================="
pct list
