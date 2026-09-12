#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  [1/3] Purgando Nginx y Servicios Web Residuales de CT 102"
echo "===================================================================="

pct exec 102 -- bash -c '
  echo "==> Deteniendo y eliminando servicio test-web (Python) si existe..."
  systemctl stop test-web 2>/dev/null || true
  systemctl disable test-web 2>/dev/null || true
  rm -f /etc/systemd/system/test-web.service

  echo "==> Deteniendo servicio nginx en CT 102..."
  systemctl stop nginx 2>/dev/null || true
  systemctl disable nginx 2>/dev/null || true

  echo "==> Purgando paquetes nginx y nginx-common..."
  export DEBIAN_FRONTEND=noninteractive
  apt-get purge -y nginx nginx-common nginx-core 2>/dev/null || true
  apt-get autoremove -y 2>/dev/null || true

  echo "==> Limpiando directorios residuales de Nginx..."
  rm -rf /etc/nginx /var/log/nginx

  echo "==> Recargando daemon systemd..."
  systemctl daemon-reload

  echo ""
  echo "==> Verificando puertos en CT 102 (Puertos 80 y 443 deben estar libres):"
  ss -tulpn | grep -E ":(80|443)" || echo "Puertos 80 y 443 100% libres en CT 102."
  
  echo ""
  echo "==> Verificando estado de Next.js (PM2):"
  pm2 list 2>/dev/null || echo "PM2 no activo como root o en este contexto."
'

echo ""
echo "===================================================================="
echo "  CT 102 LIMPIO: Nginx eliminado y desvinculado totalmente."
echo "===================================================================="
