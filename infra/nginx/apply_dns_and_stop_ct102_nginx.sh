#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  [1/2] Deteniendo y Deshabilitando Nginx de Prueba en CT 102"
echo "===================================================================="

pct exec 102 -- bash -c '
  echo "==> Deteniendo servicio nginx..."
  systemctl stop nginx || true
  systemctl disable nginx || true

  echo "==> Verificando estado del servicio nginx en CT 102:"
  systemctl is-active nginx || echo "Nginx en CT 102 está DETENIDO con éxito."

  echo "==> Verificando puertos en CT 102 (puerto 80 debe estar libre):"
  ss -tulpn | grep :80 || echo "Puerto 80 libre en CT 102."
'

echo ""
echo "===================================================================="
echo "  [2/2] Actualizando DNS BIND9 en CT 101 (clinica -> 192.168.56.103)"
echo "===================================================================="

pct exec 101 -- bash -c '
  export DEBIAN_FRONTEND=noninteractive

  echo "==> Creando respaldo de la zona actual..."
  cp /etc/bind/db.grupo2.os /etc/bind/db.grupo2.os.bak_$(date +%Y%m%d_%H%M%S)

  echo "==> Escribiendo nueva zona con clinica.grupo2.os -> 192.168.56.103 y app -> 192.168.56.102..."
  cat <<\EOF_ZONE > /etc/bind/db.grupo2.os
$TTL 604800
@       IN      SOA     ns1.grupo2.os. admin.grupo2.os. (
                              4         ; Serial (Incrementado)
                         604800         ; Refresh
                          86400         ; Retry
                        2419200         ; Expire
                         604800 )       ; Negative Cache TTL
;
; Servidores de Nombres
@       IN      NS      ns1.grupo2.os.
ns1     IN      A       192.168.56.101

; Registro de Correo
@       IN      MX  10  mail.grupo2.os.

; Registros A y CNAME de Servicios
clinica IN      A       192.168.56.103
portal  IN      CNAME   clinica.grupo2.os.
web     IN      CNAME   clinica.grupo2.os.
tienda  IN      CNAME   clinica.grupo2.os.
app     IN      A       192.168.56.102
db      IN      A       192.168.56.105
mail    IN      A       192.168.56.104
sftp    IN      A       192.168.56.104
dhcp    IN      A       192.168.56.101
EOF_ZONE

  echo "==> Verificando sintaxis del archivo de zona:"
  chown -R bind:bind /etc/bind/db.grupo2.os
  named-checkconf
  named-checkzone grupo2.os /etc/bind/db.grupo2.os

  echo "==> Reiniciando servicio named en CT 101..."
  systemctl restart named
  systemctl is-active named

  echo ""
  echo "=== PRUEBAS DE RESOLUCIÓN DNS EN CT 101 ==="
  echo -n "clinica.grupo2.os -> "
  dig @127.0.0.1 clinica.grupo2.os +short
  echo -n "app.grupo2.os     -> "
  dig @127.0.0.1 app.grupo2.os +short
  echo -n "mail.grupo2.os    -> "
  dig @127.0.0.1 mail.grupo2.os +short
'

echo ""
echo "===================================================================="
echo "  TAREAS COMPLETADAS CON ÉXITO"
echo "  1. Nginx en CT 102 detenido y deshabilitado (puerto 80 liberado)."
echo "  2. DNS BIND9 actualizado: clinica.grupo2.os resuelve a 192.168.56.103"
echo "                            app.grupo2.os resuelve a 192.168.56.102"
echo "===================================================================="
