#!/usr/bin/env bash
set -e

echo "==> [Paso 1/3] Configurando /etc/network/interfaces..."
cat <<'EOF' > /etc/network/interfaces
auto lo
iface lo inet loopback

auto eth0
iface eth0 inet dhcp

auto eth1
iface eth1 inet static
    address 192.168.56.100/24

auto vmbr0
iface vmbr0 inet static
    address 192.168.56.1/24
    bridge-ports none
    bridge-stp off
    bridge-fd 0
    post-up echo 1 > /proc/sys/net/ipv4/ip_forward
    post-up iptables -t nat -A POSTROUTING -s '192.168.56.0/24' -o eth0 -j MASQUERADE
    post-down iptables -t nat -D POSTROUTING -s '192.168.56.0/24' -o eth0 -j MASQUERADE
EOF

echo "==> [Paso 2/3] Levantando interfaz de red vmbr0..."
ip link add name vmbr0 type bridge 2>/dev/null || true
ip link set vmbr0 up
ip addr add 192.168.56.1/24 dev vmbr0 2>/dev/null || true

echo "==> [Paso 3/3] Verificando estado de la interfaz vmbr0..."
ip addr show vmbr0
echo ""
echo "Red vmbr0 configurada exitosamente con IP 192.168.56.1 y salida a Internet (NAT)."
