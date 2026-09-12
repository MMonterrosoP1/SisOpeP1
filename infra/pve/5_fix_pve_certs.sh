#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  Reparando Certificados SSL y Claves de Proxmox VE Web GUI"
echo "===================================================================="

echo "==> [1/5] Creando directorios requeridos en /etc/pve..."
mkdir -p /etc/pve/nodes/pve /etc/pve/priv

echo "==> [2/5] Generando Root CA de Proxmox (si no existe)..."
if [ ! -f /etc/pve/priv/pve-root-ca.key ]; then
  openssl genrsa -out /etc/pve/priv/pve-root-ca.key 2048
  openssl req -batch -x509 -new -nodes -key /etc/pve/priv/pve-root-ca.key -sha256 -days 3650 \
    -out /etc/pve/pve-root-ca.pem -subj "/CN=Proxmox Virtual Environment Root CA"
fi

echo "==> [3/5] Generando clave privada y certificado SSL para el nodo pve..."
openssl genrsa -out /etc/pve/nodes/pve/pve-ssl.key 2048
openssl req -batch -new -x509 -key /etc/pve/nodes/pve/pve-ssl.key -sha256 -days 3650 \
  -out /etc/pve/nodes/pve/pve-ssl.pem -subj "/CN=pve.grupo.os"

echo "==> [4/5] Generando clave de autenticación del cluster (si falta)..."
if [ ! -f /etc/pve/priv/authkey.key ]; then
  openssl genrsa -out /etc/pve/priv/authkey.key 2048
  openssl rsa -in /etc/pve/priv/authkey.key -pubout -out /etc/pve/authkey.pub
fi

echo "==> [5/5] Ajustando permisos y reiniciando demonios web..."
chmod 600 /etc/pve/priv/*.key /etc/pve/nodes/pve/*.key 2>/dev/null || true
pvecm updatecerts -f 2>/dev/null || true
systemctl restart pvedaemon pveproxy

echo ""
echo "===================================================================="
echo "  Verificando estado del puerto 8006:"
echo "===================================================================="
ss -tulpn | grep 8006 || echo "Advertencia: Esperando a que pveproxy termine de inicializar..."

echo ""
echo "Proceso completado. Ya puedes ingresar a https://localhost:8006"
