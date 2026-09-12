#!/usr/bin/env bash
# ==============================================================================
# Script 25: Rollback / Reversión de Certificados SSL (Regreso a Estado Original)
# Curso: Sistemas Operativos I — UMG (Grupo 2)
# Propósito: Restaurar el certificado SSL original en CT 103 en caso de imprevistos.
# Dónde se ejecuta: Host Proxmox VE (192.168.56.100)
# ==============================================================================
set -e

echo "===================================================================="
echo "  Revertiendo Certificado SSL al Estado Original en CT 103"
echo "===================================================================="

pct exec 103 -- bash -c "
  # 1. Si existe el respaldo original, restaurarlo
  if [ -f /etc/nginx/ssl/clinica.grupo2.os.crt.bak_original ]; then
    echo '==> [Restauración] Recuperando copia original de certificados...'
    cp /etc/nginx/ssl/clinica.grupo2.os.crt.bak_original /etc/nginx/ssl/clinica.grupo2.os.crt
    cp /etc/nginx/ssl/clinica.grupo2.os.key.bak_original /etc/nginx/ssl/clinica.grupo2.os.key
  else
    echo '==> [Regeneración] No se encontró backup previo. Creando certificado básico original (sin SAN)...'
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/clinica.grupo2.os.key \
      -out /etc/nginx/ssl/clinica.grupo2.os.crt \
      -subj \"/CN=clinica.grupo2.os/O=Clinica Grupo 2/C=GT\"
  fi

  # 2. Ajustar permisos
  chmod 600 /etc/nginx/ssl/clinica.grupo2.os.key
  chmod 644 /etc/nginx/ssl/clinica.grupo2.os.crt

  # 3. Reiniciar Nginx
  echo '==> Verificando sintaxis y reiniciando Nginx...'
  nginx -t
  systemctl restart nginx
"

echo ""
echo "===================================================================="
echo "  Rollback completado con éxito."
echo "  El servidor Nginx en CT 103 ha vuelto a su configuración anterior."
echo "===================================================================="
