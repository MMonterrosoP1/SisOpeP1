#!/usr/bin/env bash
# ==============================================================================
# Script: 21_fix_better_auth_and_https_ct102.sh
# Propósito: Solucionar el error HTTP 500 (Internal Server Error) en https://clinica.grupo2.os
#
# Contexto educativo (¿Qué está pasando?):
# ------------------------------------------------------------------------------
# 1. Cuando el usuario entra por HTTPS a 'https://clinica.grupo2.os', Nginx en CT 103
#    descifra el SSL y traslada la petición a Next.js (CT 102) con la cabecera:
#    'X-Forwarded-Proto: https'.
#
# 2. Next.js ejecuta su middleware (src/proxy.ts) que verifica si hay sesión activa:
#    betterFetch('/api/auth/get-session', { baseURL: request.nextUrl.origin })
#    Como el origen es 'https://clinica.grupo2.os', Node.js intenta hacer un fetch
#    HTTPS hacia ese dominio.
#
# 3. CONFLICTO 1: En /etc/hosts de CT 102, 'clinica.grupo2.os' apuntaba a 127.0.0.1
#    (donde no hay ningún servidor SSL en el puerto 443). Esto provocaba el error
#    crítico: 'ERR_SSL_WRONG_VERSION_NUMBER' / Connection Refused.
#
# 4. CONFLICTO 2: Hacer que CT 102 salga a la red externa por HTTPS para consultar su
#    propia API local es ineficiente y falla por certificados autofirmados.
#
# 5. CONFLICTO 3: En el archivo .env, BETTER_AUTH_URL seguía en 'http://' plano y
#    faltaba autorizar el dominio HTTPS en BETTER_AUTH_TRUSTED_ORIGINS.
# ==============================================================================

set -e

echo "===================================================================="
echo "  [Fase 3] Reparando Autenticación HTTPS & Better Auth en CT 102"
echo "===================================================================="

# Asegurar que pct esté en PATH
export PATH=$PATH:/usr/sbin:/usr/bin

# ------------------------------------------------------------------------------
# PASO 1: Corregir /etc/hosts y DNS dentro de CT 102
# ------------------------------------------------------------------------------
echo ""
echo "==> [Paso 1/4] Corrigiendo resolución de nombres en CT 102 (/etc/hosts)..."
pct exec 102 -- bash -c '
  # Respaldo preventivo
  cp /etc/hosts /etc/hosts.bak_$(date +%Y%m%d_%H%M%S)

  # 1. Quitar los dominios del grupo de la línea 127.0.0.1
  sed -i "s/127.0.0.1.*/127.0.0.1 localhost/" /etc/hosts

  # 2. Agregar la resolución correcta apuntando hacia el Nginx Proxy (CT 103: 192.168.56.103)
  if ! grep -q "192.168.56.103 clinica.grupo2.os" /etc/hosts; then
    echo "192.168.56.103 clinica.grupo2.os portal.grupo2.os web.grupo2.os" >> /etc/hosts
  fi

  # 3. Configurar DNS BIND9 (CT 101) como primario en resolv.conf
  cat <<EOF > /etc/resolv.conf
nameserver 192.168.56.101
nameserver 8.8.8.8
search grupo2.os
EOF

  echo "  Archivo /etc/hosts actualizado. clinica.grupo2.os ahora apunta a CT 103 (192.168.56.103)."
'

# ------------------------------------------------------------------------------
# PASO 2: Optimizar la llamada interna de sesión en src/proxy.ts
# ------------------------------------------------------------------------------
echo ""
echo "==> [Paso 2/4] Optimizando middleware interno de sesión en src/proxy.ts..."
pct exec 102 -- bash -c '
  APP_DIR="/var/www/proyecto-grupo2"
  PROXY_FILE="$APP_DIR/src/proxy.ts"

  if [ -f "$PROXY_FILE" ]; then
    # Respaldo preventivo
    cp "$PROXY_FILE" "$PROXY_FILE.bak_$(date +%Y%m%d_%H%M%S)"

    # Reemplazar baseURL: request.nextUrl.origin por la URL local directa en localhost:3000
    # Esto garantiza latencia de 0 ms y evita problemas de certificados SSL o ruteo en llamadas servidor-servidor.
    sed -i "s|baseURL: request.nextUrl.origin|baseURL: \"http://127.0.0.1:3000\"|g" "$PROXY_FILE"
    echo "  src/proxy.ts ajustado para usar baseURL local (http://127.0.0.1:3000)."
  else
    echo "  No se encontró $PROXY_FILE, omitiendo este ajuste."
  fi
'

# ------------------------------------------------------------------------------
# PASO 3: Actualizar las variables de entorno (.env) de Next.js
# ------------------------------------------------------------------------------
echo ""
echo "==> [Paso 3/4] Actualizando variables en /var/www/proyecto-grupo2/.env..."
pct exec 102 -- bash -c '
  ENV_FILE="/var/www/proyecto-grupo2/.env"
  cp "$ENV_FILE" "$ENV_FILE.bak_$(date +%Y%m%d_%H%M%S)"

  # 1. Configurar BETTER_AUTH_URL con HTTPS estricto
  if grep -q "^BETTER_AUTH_URL=" "$ENV_FILE"; then
    sed -i "s|^BETTER_AUTH_URL=.*|BETTER_AUTH_URL=\"https://clinica.grupo2.os\"|g" "$ENV_FILE"
  else
    echo "BETTER_AUTH_URL=\"https://clinica.grupo2.os\"" >> "$ENV_FILE"
  fi

  # 2. Configurar BETTER_AUTH_TRUSTED_ORIGINS incluyendo HTTPS y HTTP de desarrollo
  TRUSTED="https://clinica.grupo2.os,http://clinica.grupo2.os,http://192.168.56.102:3000,http://localhost:3000"
  if grep -q "^BETTER_AUTH_TRUSTED_ORIGINS=" "$ENV_FILE"; then
    sed -i "s|^BETTER_AUTH_TRUSTED_ORIGINS=.*|BETTER_AUTH_TRUSTED_ORIGINS=\"$TRUSTED\"|g" "$ENV_FILE"
  else
    echo "BETTER_AUTH_TRUSTED_ORIGINS=\"$TRUSTED\"" >> "$ENV_FILE"
  fi

  # 3. Permitir certificados autofirmados para fetch interno en Node.js si fuera necesario
  if ! grep -q "^NODE_TLS_REJECT_UNAUTHORIZED=" "$ENV_FILE"; then
    echo "NODE_TLS_REJECT_UNAUTHORIZED=\"0\"" >> "$ENV_FILE"
  fi

  echo "  .env configurado con HTTPS oficial y Trusted Origins."
'

# ------------------------------------------------------------------------------
# PASO 4: Compilar Next.js para aplicar los cambios del middleware en producción
# ------------------------------------------------------------------------------
echo ""
echo "==> [Paso 4/5] Compilando el proyecto Next.js con pnpm run build..."
pct exec 102 -- bash -c '
  cd /var/www/proyecto-grupo2
  /opt/node-v20.18.0-linux-x64/bin/pnpm run build
'

# ------------------------------------------------------------------------------
# PASO 5: Reiniciar proceso PM2 con lectura forzada de entorno (--update-env)
# ------------------------------------------------------------------------------
echo ""
echo "==> [Paso 5/5] Reiniciando la aplicación en PM2 con --update-env..."
pct exec 102 -- bash -c '
  # Crear enlaces simbólicos en /usr/bin para disponibilidad global
  ln -sf /opt/node-v20.18.0-linux-x64/bin/* /usr/bin/ 2>/dev/null || true

  # Reiniciar proceso "clinica" forzando la actualización de variables
  PM2_BIN="/opt/node-v20.18.0-linux-x64/bin/pm2"
  $PM2_BIN restart clinica --update-env 2>/dev/null || $PM2_BIN restart all --update-env

  sleep 2
  $PM2_BIN status
'

echo ""
echo "===================================================================="
echo "  REPARACIÓN COMPLETADA CON ÉXITO"
echo "===================================================================="
echo "Prueba de validación desde Proxmox:"
curl -k -I https://clinica.grupo2.os --resolve clinica.grupo2.os:443:192.168.56.103 | head -n 5
echo ""
echo "Ya puedes probar en tu navegador: https://clinica.grupo2.os/"
echo "===================================================================="
