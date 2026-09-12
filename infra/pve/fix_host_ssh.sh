#!/usr/bin/env bash
set -e

echo "==> [1/2] Habilitando login SSH con contraseña para root en el Host Proxmox..."
sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin yes/' /etc/ssh/sshd_config
sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config
mkdir -p /etc/ssh/sshd_config.d
echo "PermitRootLogin yes" > /etc/ssh/sshd_config.d/root-login.conf
echo "PasswordAuthentication yes" >> /etc/ssh/sshd_config.d/root-login.conf
echo "root:proxmox" | chpasswd
systemctl restart ssh

echo "==> [2/2] Encendiendo los 5 contenedores LXC..."
for id in 101 102 103 104 105; do
  pct start $id 2>/dev/null || true
  pct set $id -onboot 1 2>/dev/null || true
done

echo ""
echo "SSH habilitado y Contenedores 101 al 105 encendidos."
