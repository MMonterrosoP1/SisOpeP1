#!/usr/bin/env bash

echo "===================================================================="
echo "  ACTIVANDO SERVICIO WEB Y PUENTE DE RED (PROXMOX PVE)"
echo "===================================================================="

# 1. Conectar eth1 a vmbr0
echo "==> [1/4] Conectando tarjeta eth1 al switch vmbr0..."
ip link set eth1 up 2>/dev/null
ip link set eth1 master vmbr0 2>/dev/null || brctl addif vmbr0 eth1 2>/dev/null || true
ip addr add 192.168.56.100/24 dev vmbr0 2>/dev/null || true
ip link set vmbr0 up

# 2. Iniciar CT 101 y 102 si están apagados
echo "==> [2/4] Verificando que CT 101 y 102 estén corriendo..."
pct start 101 2>/dev/null || true
pct start 102 2>/dev/null || true
pct set 101 -onboot 1 2>/dev/null || true
pct set 102 -onboot 1 2>/dev/null || true

# 3. Configurar servicio permanente en CT 102 con systemd
echo "==> [3/4] Creando y activando servicio web persistente en CT 102..."
pct exec 102 -- bash -c '
  mkdir -p /var/www/html
  cat <<EOF > /var/www/html/index.html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Clinica Grupo 2 - Test</title>
  <style>
    body { font-family: sans-serif; text-align: center; padding-top: 60px; background-color: #f0f4f8; }
    .card { background: white; padding: 40px; border-radius: 16px; display: inline-block; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
    h1 { color: #1e40af; font-size: 26px; }
    code { background: #f1f5f9; padding: 4px 8px; border-radius: 6px; color: #dc2626; font-size: 1.1em; }
    .status { margin-top: 20px; padding: 10px; background: #ecfdf5; color: #065f46; border-radius: 8px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>¡Hola Mundo! — Clínica Grupo 2</h1>
    <p>Servidor Web respondiendo en el contenedor <strong>CT 102</strong>.</p>
    <p>IP: <code>192.168.56.102</code> | Dominio: <code>clinica.grupo2.os</code></p>
    <div class="status">Conectividad 100% Operativa</div>
  </div>
</body>
</html>
EOF

  cat <<EOF_SVC > /etc/systemd/system/test-web.service
[Unit]
Description=Servidor Web Python Permanente
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/python3 -m http.server 80 --bind 0.0.0.0 --directory /var/www/html
Restart=always

[Install]
WantedBy=multi-user.target
EOF_SVC

  systemctl daemon-reload
  systemctl enable --now test-web.service
  systemctl restart test-web.service
'

# 4. Probar y verificar respuestas
echo "==> [4/4] Probando conectividad..."
pct exec 101 -- systemctl restart named 2>/dev/null || true

sleep 2
echo "Estado de puertos en CT 102:"
pct exec 102 -- ss -tulpn | grep 80

echo ""
echo "Respuesta HTTP interna:"
curl -I http://192.168.56.102 | head -n 2

echo ""
echo "===================================================================="
echo "  TODO LISTO Y ACTIVO"
echo "  Abre en tu navegador de Windows: http://192.168.56.102"
echo "  Abre por Dominio:                http://clinica.grupo2.os"
echo "===================================================================="
