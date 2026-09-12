#!/usr/bin/env bash
# ==============================================================================
# Script 23: Configuración Automatizada de Restricción WAN (Egress Filtering)
# Curso: Sistemas Operativos I — UMG (Grupo 2)
# Propósito: Bloquear salida a Internet en CT 105 (BD), CT 104 (Mail) y CT 102 (App)
#            manteniendo libre la comunicación en la red local 192.168.56.0/24.
# Dónde se ejecuta: Host Proxmox VE (192.168.56.100)
# ==============================================================================
set -e

LOCAL_NET="192.168.56.0/24"

echo "===================================================================="
echo "  Aplicando Restricción WAN (Egress Filtering) en Contenedores"
echo "===================================================================="

# 0. Limpiar reglas previas de bloqueo en FORWARD para permitir apt si es necesario
iptables -D FORWARD -s 192.168.56.105 -o eth0 -j REJECT --reject-with icmp-admin-prohibited 2>/dev/null || true
iptables -D FORWARD -s 192.168.56.104 -o eth0 -j REJECT --reject-with icmp-admin-prohibited 2>/dev/null || true
iptables -D FORWARD -s 192.168.56.102 -o eth0 -j REJECT --reject-with icmp-admin-prohibited 2>/dev/null || true

# Función para aplicar reglas de salida en un contenedor
apply_egress_block() {
  local ctid=$1
  local name=$2
  echo "==> Verificando y aplicando bloqueo WAN en CT $ctid ($name)..."
  
  pct exec $ctid -- bash -c "
    # Si no tiene iptables instalado, instalarlo silenciosamente
    if ! command -v iptables >/dev/null 2>&1; then
      echo '    Instalando paquete iptables en CT $ctid...'
      DEBIAN_FRONTEND=noninteractive apt-get update -y -qq >/dev/null 2>&1 || true
      DEBIAN_FRONTEND=noninteractive apt-get install -y -qq iptables iptables-persistent >/dev/null 2>&1 || true
    fi

    # Aplicar reglas de salida restringida
    iptables -F OUTPUT || true
    iptables -A OUTPUT -o lo -j ACCEPT
    iptables -A OUTPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
    iptables -A OUTPUT -d $LOCAL_NET -j ACCEPT
    iptables -A OUTPUT -j REJECT --reject-with icmp-admin-prohibited
    
    which netfilter-persistent >/dev/null 2>&1 && netfilter-persistent save >/dev/null 2>&1 || true
  "
  echo "    CT $ctid protegido con éxito."
}

# 1. CT 105 - Base de Datos MariaDB
apply_egress_block 105 "MariaDB SQL"

# 2. CT 104 - Mail y SFTP
apply_egress_block 104 "Mail & SFTP"

# 3. CT 102 - Backend Next.js
apply_egress_block 102 "Backend Next.js"

# 4. Reglas perimetrales definitivas en el Host Proxmox (FORWARD hacia eth0)
echo "==> Aplicando reglas perimetrales en Host Proxmox (FORWARD hacia eth0)..."
iptables -I FORWARD 1 -s 192.168.56.105 -o eth0 -j REJECT --reject-with icmp-admin-prohibited
iptables -I FORWARD 2 -s 192.168.56.104 -o eth0 -j REJECT --reject-with icmp-admin-prohibited
iptables -I FORWARD 3 -s 192.168.56.102 -o eth0 -j REJECT --reject-with icmp-admin-prohibited

echo ""
echo "===================================================================="
echo "  EGRESS FILTERING APLICADO EXITOSAMENTE (DOBLE CAPA)"
echo "  - CT 105, CT 104 y CT 102: Salida a Internet BLOQUEADA."
echo "  - Comunicación local (192.168.56.0/24): 100% LIBRE Y OPERATIVA."
echo "  - CT 101 (DNS) y CT 103 (Web): Salida WAN MANTENIDA."
echo "===================================================================="
