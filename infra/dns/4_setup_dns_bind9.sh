#!/usr/bin/env bash
set -e

GROUP_NAME="${1:-grupo2}"
DOMAIN="${GROUP_NAME}.os"

echo "===================================================================="
echo "  Configurando BIND9 DNS Autoritativo en CT 101 para: $DOMAIN"
echo "===================================================================="

# 1. Configurar BIND9 dentro del CT 101
pct exec 101 -- bash -c '
  export DEBIAN_FRONTEND=noninteractive

  echo "==> [1/4] Instalando BIND9 y utilidades..."
  apt-get update -y >/dev/null 2>&1 || true
  apt-get install -y bind9 bind9utils dnsutils

  echo "==> [2/4] Configurando /etc/bind/named.conf.options..."
  cat <<EOF_OPT > /etc/bind/named.conf.options
options {
    directory "/var/cache/bind";

    forwarders {
        8.8.8.8;
        1.1.1.1;
    };

    dnssec-validation no;
    auth-nxdomain no;
    listen-on { any; };
    listen-on-v6 { any; };
    allow-query { any; };
    allow-query-cache { any; };
    allow-recursion { any; };
    recursion yes;
};
EOF_OPT

  echo "==> [3/4] Declarando zona autoritativa grupo2.os en named.conf.local..."
  cat <<EOF_LOC > /etc/bind/named.conf.local
zone "grupo2.os" {
    type master;
    file "/etc/bind/db.grupo2.os";
};
EOF_LOC

  echo "==> [4/4] Escribiendo archivo de zona /etc/bind/db.grupo2.os..."
  cat <<\EOF_DB > /etc/bind/db.grupo2.os
$TTL 604800
@       IN      SOA     ns1.grupo2.os. admin.grupo2.os. (
                              3         ; Serial
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
EOF_DB

  echo "==> Verificando sintaxis de zona con named-checkzone:"
  chown -R bind:bind /etc/bind /var/cache/bind
  named-checkconf
  named-checkzone grupo2.os /etc/bind/db.grupo2.os

  echo "==> Reiniciando servicio named..."
  systemctl restart named
  systemctl enable named
'

echo ""
echo "===================================================================="
echo "  Prueba de Resolución DNS Interna en CT 101:"
echo "===================================================================="
pct exec 101 -- dig @127.0.0.1 clinica.grupo2.os +short
pct exec 101 -- dig @127.0.0.1 mail.grupo2.os +short
pct exec 101 -- dig @127.0.0.1 db.grupo2.os +short

echo ""
echo "Servidor DNS BIND9 listo y resolviendo grupo2.os con éxito."
