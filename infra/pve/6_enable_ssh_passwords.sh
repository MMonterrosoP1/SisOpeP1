#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  Habilitando Login SSH con Contraseña para Usuario Root"
echo "===================================================================="

for id in 101 102 103 104; do
  echo "==> Configurando SSH en Contenedor $id..."
  pct exec $id -- bash -c "
    sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
    sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
    mkdir -p /etc/ssh/sshd_config.d
    echo 'PermitRootLogin yes' > /etc/ssh/sshd_config.d/root-login.conf
    echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config.d/root-login.conf
    echo 'root:proxmox' | chpasswd
    systemctl restart ssh || systemctl restart sshd
  "
done

echo ""
echo "Acceso SSH con contraseña 'proxmox' habilitado en los 4 contenedores."
