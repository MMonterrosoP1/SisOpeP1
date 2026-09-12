#!/usr/bin/env bash
# ==============================================================================
# Script 24: Regeneración de Certificados SSL con SAN (Subject Alternative Name)
# Curso: Sistemas Operativos I — UMG (Grupo 2)
# Propósito: Resolver el error 'net::ERR_CERT_COMMON_NAME_INVALID' en Chrome/Edge.
#            Los navegadores modernos ignoran el Common Name (CN) y exigen SAN.
# Dónde se ejecuta: Host Proxmox VE (192.168.56.100)
# ==============================================================================
set -e

DOMAIN="clinica.grupo2.os"
IP_PROXY="192.168.56.103"

echo "===================================================================="
echo "  Regenerando Certificado SSL con Extensión SAN en CT 103"
echo "===================================================================="

pct exec 103 -- bash -c "
  mkdir -p /etc/nginx/ssl

  # 0. Respaldo preventivo de certificados anteriores
  if [ -f /etc/nginx/ssl/clinica.grupo2.os.crt ] && [ ! -f /etc/nginx/ssl/clinica.grupo2.os.crt.bak_original ]; then
    echo '==> [Respaldo] Guardando copia de certificados originales...'
    cp /etc/nginx/ssl/clinica.grupo2.os.crt /etc/nginx/ssl/clinica.grupo2.os.crt.bak_original
    cp /etc/nginx/ssl/clinica.grupo2.os.key /etc/nginx/ssl/clinica.grupo2.os.key.bak_original
  fi

  # 1. Crear archivo de configuración temporal con extensiones v3 y SAN
  cat <<'EOF_SSL' > /tmp/openssl_san.cnf
[req]
default_bits       = 2048
prompt             = no
default_md         = sha256
x509_extensions    = v3_req
distinguished_name = req_distinguished_name

[req_distinguished_name]
C  = GT
ST = Guatemala
L  = Guatemala
O  = Clinica Grupo 2
OU = Sistemas Operativos I
CN = clinica.grupo2.os

[v3_req]
basicConstraints     = CA:TRUE
keyUsage             = digitalSignature, keyEncipherment, keyCertSign
extendedKeyUsage     = serverAuth
subjectAltName       = @alt_names

[alt_names]
DNS.1 = clinica.grupo2.os
DNS.2 = *.grupo2.os
DNS.3 = portal.grupo2.os
DNS.4 = web.grupo2.os
DNS.5 = tienda.grupo2.os
IP.1  = 192.168.56.103
IP.2  = 192.168.56.102
IP.3  = 192.168.56.100
IP.4  = 127.0.0.1
EOF_SSL

  # 2. Generar nueva llave privada y certificado con SAN válido por 365 días
  echo '==> Generando certificado SSL X.509 v3 con SAN...'
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/clinica.grupo2.os.key \
    -out /etc/nginx/ssl/clinica.grupo2.os.crt \
    -config /tmp/openssl_san.cnf

  # 3. Permisos seguros
  chmod 600 /etc/nginx/ssl/clinica.grupo2.os.key
  chmod 644 /etc/nginx/ssl/clinica.grupo2.os.crt
  rm -f /tmp/openssl_san.cnf

  # 4. Validar sintaxis y reiniciar Nginx
  echo '==> Reiniciando Nginx en CT 103...'
  nginx -t
  systemctl restart nginx
"

echo ""
echo "===================================================================="
echo "  Certificado generado exitosamente con SAN."
echo "  Dominios autorizados: clinica.grupo2.os, *.grupo2.os, portal, web"
echo "  IPs autorizadas: 192.168.56.103, 192.168.56.102, 127.0.0.1"
echo "===================================================================="
echo ""
echo "PASO SIGUIENTE EN LA COMPUTADORA CLIENTE:"
echo "1. Descargar el nuevo certificado:"
echo "   scp root@192.168.56.103:/etc/nginx/ssl/clinica.grupo2.os.crt ."
echo "2. En Windows (PowerShell Administrador):"
echo "   Import-Certificate -FilePath .\clinica.grupo2.os.crt -CertStoreLocation Cert:\LocalMachine\Root"
echo "3. Reiniciar el navegador y entrar a https://clinica.grupo2.os"
