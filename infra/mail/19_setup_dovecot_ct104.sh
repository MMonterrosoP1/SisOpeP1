#!/usr/bin/env bash
set -e

echo "===================================================================="
echo "  Instalando y Configurando Dovecot IMAP en CT 104 (mail-sftp)"
echo "===================================================================="

# 1. Asegurar que CT 104 esté encendido
echo "==> [1/5] Verificando que CT 104 esté en ejecución..."
pct status 104 | grep -q "status: running" || pct start 104

# 2. Configurar Dovecot dentro de CT 104
pct exec 104 -- bash -c '
  export DEBIAN_FRONTEND=noninteractive

  echo "==> [2/5] Instalando dovecot-imapd..."
  apt-get update -y >/dev/null 2>&1 || true
  apt-get install -y dovecot-imapd

  echo "==> [3/5] Configurando ubicación de buzones a Maildir..."
  # Ajustar mail_location a maildir:~/Maildir
  sed -i "s|^#\?mail_location =.*|mail_location = maildir:~/Maildir|" /etc/dovecot/conf.d/10-mail.conf

  echo "==> [4/5] Permitiendo autenticación con contraseña en red local..."
  # Habilitar autenticación de texto plano en red interna
  sed -i "s|^#\?disable_plaintext_auth =.*|disable_plaintext_auth = no|" /etc/dovecot/conf.d/10-auth.conf

  echo "==> [5/5] Reiniciando y verificando servicio Dovecot..."
  systemctl restart dovecot
  systemctl enable dovecot

  echo ""
  echo "=== ESTADO DEL PUERTO IMAP (143) ==="
  ss -tulpn | grep 143 || true

  # Enviar correo de bienvenida de prueba
  cat <<EOF_MAIL | /usr/sbin/sendmail -t
To: paciente@grupo2.os
From: notificaciones@grupo2.os
Subject: [IMAP Activo] Bienvenido a su buzon clinico

Estimado paciente,
Su buzon IMAP en mail.grupo2.os (puerto 143) esta configurado y funcionando correctamente.
Ya puede sincronizar y leer sus correos desde Thunderbird, Outlook o la app Correo en Windows.
EOF_MAIL
'

echo ""
echo "===================================================================="
echo "  SERVIDOR IMAP DOVECOT OPERATIVO EN CT 104 (192.168.56.104)"
echo "  Protocolo: IMAP (Puerto 143)"
echo "  Cliente recomendado: Mozilla Thunderbird en Windows"
echo "  Cuentas listas: paciente / medico (Contraseña: proxmox)"
echo "===================================================================="
