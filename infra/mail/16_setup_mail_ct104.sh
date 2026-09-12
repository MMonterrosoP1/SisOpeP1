#!/usr/bin/env bash
set -e

DOMAIN="grupo2.os"
MAIL_HOST="mail.grupo2.os"

echo "===================================================================="
echo "  Configurando Servidor Postfix SMTP en CT 104 ($MAIL_HOST)"
echo "===================================================================="

# 1. Asegurar que CT 104 esté encendido
echo "==> Verificando estado de CT 104..."
pct status 104 | grep -q "status: running" || pct start 104
pct set 104 -onboot 1 2>/dev/null || true

# 2. Configurar Postfix dentro de CT 104
pct exec 104 -- bash -c "
  export DEBIAN_FRONTEND=noninteractive

  echo '==> [1/5] Preconfigurando debconf e instalando Postfix + utilidades...'
  echo \"postfix postfix/mailname string $DOMAIN\" | debconf-set-selections
  echo \"postfix postfix/main_mailer_type string 'Internet Site'\" | debconf-set-selections

  which sendmail >/dev/null 2>&1 || {
    apt-get update -y || true
    apt-get install -y postfix curl || true
  }

  echo '$DOMAIN' > /etc/mailname

  echo '==> [2/5] Ajustando directivas en /etc/postfix/main.cf...'
  postconf -e \"myhostname = $MAIL_HOST\"
  postconf -e \"mydomain = $DOMAIN\"
  postconf -e \"myorigin = /etc/mailname\"
  postconf -e \"mydestination = \$myhostname, $DOMAIN, localhost.\$mydomain, localhost\"
  postconf -e \"mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 192.168.56.0/24\"
  postconf -e \"inet_interfaces = all\"
  postconf -e \"inet_protocols = ipv4\"
  postconf -e \"home_mailbox = Maildir/\"
  postconf -e \"smtpd_banner = \$myhostname ESMTP Clinica Grupo 2\"

  echo '==> [3/5] Creando buzones y cuentas de prueba (paciente y medico)...'
  id -u paciente &>/dev/null || useradd -m -s /bin/bash paciente
  echo 'paciente:proxmox' | chpasswd
  mkdir -p /home/paciente/Maildir/{cur,new,tmp}
  chown -R paciente:paciente /home/paciente/Maildir
  chmod -R 700 /home/paciente/Maildir

  id -u medico &>/dev/null || useradd -m -s /bin/bash medico
  echo 'medico:proxmox' | chpasswd
  mkdir -p /home/medico/Maildir/{cur,new,tmp}
  chown -R medico:medico /home/medico/Maildir
  chmod -R 700 /home/medico/Maildir

  echo '==> [4/5] Reiniciando y habilitando servicio Postfix...'
  systemctl restart postfix
  systemctl enable postfix

  echo '==> [5/5] Realizando prueba local interna de envÃ­o de correo...'
  cat <<EOF_MAIL | /usr/sbin/sendmail -t
Subject: Bienvenida Clinica Grupo 2
To: paciente@$DOMAIN
From: notificaciones@$DOMAIN

Estimado paciente, su cita en Clinica Grupo 2 ha sido confirmada con exito.
EOF_MAIL
  sleep 2

  echo 'Verificando buzÃ³n Maildir de paciente:'
  ls -la /home/paciente/Maildir/new/
"

echo ""
echo "===================================================================="
echo "  POSTFIX SMTP OPERATIVO EN CT 104 (192.168.56.104)"
echo "  Hostname: $MAIL_HOST"
echo "  Dominio:  $DOMAIN"
echo "  Puerto:   25 (Abierto para CT 103 Next.js / red 192.168.56.0/24)"
echo "===================================================================="
