#!/usr/bin/env bash
set -e

DOMAIN="clinica.grupo2.os"

echo "===================================================================="
echo "  Configurando Nginx Reverse Proxy + SSL en CT 103 (Web Proxy)"
echo "===================================================================="

pct exec 103 -- bash -c "
  export DEBIAN_FRONTEND=noninteractive

  echo '==> [1/4] Instalando Nginx y OpenSSL en CT 103...'
  apt-get update -y
  apt-get install -y nginx openssl

  echo '==> [2/4] Generando Certificado SSL autofirmado para $DOMAIN...'
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/$DOMAIN.key \
    -out /etc/nginx/ssl/$DOMAIN.crt \
    -subj \"/CN=$DOMAIN/O=Clinica Grupo 2/C=GT\"

  chmod 600 /etc/nginx/ssl/$DOMAIN.key
  chmod 644 /etc/nginx/ssl/$DOMAIN.crt

  echo '==> [3/4] Configurando Virtual Host con HTTPS estricto y Proxy Pass hacia CT 102 (:3000)...'
  cat <<'EOF_NGINX' > /etc/nginx/sites-available/$DOMAIN
# Bloque 1: Redirección obligatoria de HTTP (80) a HTTPS (443)
server {
    listen 80;
    listen [::]:80;
    server_name clinica.grupo2.os portal.grupo2.os web.grupo2.os tienda.grupo2.os;
    return 301 https://\$host\$request_uri;
}

# Bloque 2: Servidor HTTPS seguro (443) -> Reverse Proxy hacia Next.js (CT 102:3000)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name clinica.grupo2.os portal.grupo2.os web.grupo2.os tienda.grupo2.os;

    ssl_certificate /etc/nginx/ssl/clinica.grupo2.os.crt;
    ssl_certificate_key /etc/nginx/ssl/clinica.grupo2.os.key;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Tamaño máximo para subida de constancias / archivos
    client_max_body_size 20M;

    # Proxy hacia el servidor Next.js en CT 102
    location / {
        proxy_pass http://192.168.56.102:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host \$host;
    }
}
EOF_NGINX

  # Habilitar sitio y deshabilitar default
  ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default

  echo '==> [4/4] Verificando sintaxis y reiniciando Nginx en CT 103...'
  nginx -t
  systemctl restart nginx
  systemctl enable nginx
"

echo ""
echo "===================================================================="
echo "  NGINX PROXY HTTPS CONFIGURADO EN CT 103 (192.168.56.103)"
echo "  Recibe tráfico en: https://$DOMAIN (Puertos 80/443)"
echo "  Redirige internamente a: http://192.168.56.102:3000"
echo "===================================================================="
