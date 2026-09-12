#!/usr/bin/env bash
# ==============================================================================
# Script 22: Configuración Automatizada de Aislamiento de Bases de Datos
# Curso: Sistemas Operativos I — UMG (Grupo 2)
# Propósito: Bloquear puertos 3306 (MariaDB) y 6379 (Redis) para todas las IPs,
#            permitiendo acceso EXCLUSIVO al servidor de aplicación (CT 102).
# Dónde se ejecuta: Host Proxmox VE (192.168.56.100)
# ==============================================================================
set -e

APP_IP="192.168.56.102"
DB_IP="192.168.56.105"
PROXY_IP="192.168.56.103"

echo "===================================================================="
echo "  Configurando Aislamiento de Bases de Datos (Firewall iptables)"
echo "===================================================================="

# 1. Configuración en CT 105 (MariaDB - Puerto 3306)
echo "==> [1/3] Aplicando reglas en CT 105 (MariaDB SQL :3306)..."
pct exec 105 -- bash -c "
  # Limpiar reglas previas en INPUT
  iptables -F INPUT || true
  
  # Tráfico local y sesiones establecidas
  iptables -A INPUT -i lo -j ACCEPT
  iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
  iptables -A INPUT -p tcp --dport 22 -j ACCEPT
  
  # PERMITIR SOLO A CT 102 (App Server)
  iptables -A INPUT -p tcp -s $APP_IP --dport 3306 -j ACCEPT
  
  # BLOQUEAR A TODO EL RESTO
  iptables -A INPUT -p tcp --dport 3306 -j REJECT --reject-with icmp-port-unreachable
  
  # Persistencia
  which netfilter-persistent >/dev/null 2>&1 && netfilter-persistent save || true
"

# 2. Configuración en CT 103 (Redis NoSQL - Puerto 6379)
echo "==> [2/3] Aplicando reglas en CT 103 (Redis NoSQL :6379)..."
pct exec 103 -- bash -c "
  # Permitir local y sesiones establecidas
  iptables -I INPUT 1 -i lo -j ACCEPT
  iptables -I INPUT 2 -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
  
  # PERMITIR SOLO A CT 102 (App Server)
  iptables -I INPUT 3 -p tcp -s $APP_IP --dport 6379 -j ACCEPT
  
  # BLOQUEAR A TODO EL RESTO
  iptables -I INPUT 4 -p tcp --dport 6379 -j REJECT --reject-with icmp-port-unreachable
  
  # Persistencia
  which netfilter-persistent >/dev/null 2>&1 && netfilter-persistent save || true
"

# 3. Configuración en Host Proxmox (vmbr0 Forwarding)
echo "==> [3/3] Aplicando reglas perimetrales en Host Proxmox (FORWARD)..."
modprobe br_netfilter 2>/dev/null || true
sysctl -w net.bridge.bridge-nf-call-iptables=1 2>/dev/null || true

# Limpiar reglas anteriores específicas si existen y reaplicar
iptables -I FORWARD 1 -p tcp -s $APP_IP -d $DB_IP --dport 3306 -j ACCEPT
iptables -I FORWARD 2 -p tcp -d $DB_IP --dport 3306 -j REJECT --reject-with icmp-port-unreachable
iptables -I FORWARD 3 -p tcp -s $APP_IP -d $PROXY_IP --dport 6379 -j ACCEPT
iptables -I FORWARD 4 -p tcp -d $PROXY_IP --dport 6379 -j REJECT --reject-with icmp-port-unreachable

echo ""
echo "===================================================================="
echo "  AISLAMIENTO DE BASES DE DATOS APLICADO EXITOSAMENTE"
echo "  - MariaDB (CT 105 :3306): Solo accesible desde $APP_IP"
echo "  - Redis (CT 103 :6379): Solo accesible desde $APP_IP"
echo "===================================================================="
