# 🔒 Guía de Autonomía Total para Aaron: Solución a `net::ERR_CERT_COMMON_NAME_INVALID`
> **Para:** Aaron (Integrante 3 — Grupo 2)  
> **Proyecto:** Sistema Clínico Grupo 2 — Sistemas Operativos I (UMG)  
> **Acceso Remoto:** 100% Autónomo vía **Tailscale VPN** (Subred `192.168.56.0/24`)  
> **Servidor Destino:** CT 103 (Nginx Web Proxy — `192.168.56.103`)  
> **Objetivo:** Ejecutar tú mismo todo el proceso en 3 minutos, eliminar la alerta roja en Chrome/Edge y activar el **candado de seguridad** en `https://clinica.grupo2.os`.

---

## 💡 1. ¿Qué significa este error en palabras sencillas?

¡Buenas noticias, Aaron! Lo que hiciste anteriormente en tu Windows **sí funcionó**: Windows ya confía en el certificado.

El nuevo error (`ERR_CERT_COMMON_NAME_INVALID`) ocurre por dos detalles:
1. **Chrome y Edge ya no usan el método viejo:** Antes, los navegadores leían un solo campo llamado *Common Name (CN)* (ej. `clinica.grupo2.os`). Hoy en día, los navegadores basados en Chromium **ignoran ese campo** y exigen obligatoriamente una lista interna llamada **SAN (*Subject Alternative Name* o Nombres Alternativos)**.
2. **Entrar por IP en lugar de dominio:** Si probaste escribiendo `https://192.168.56.103` en lugar del nombre `https://clinica.grupo2.os`, el navegador rechaza la conexión porque una dirección IP no es un texto, a menos que esté declarada expresamente dentro de la lista SAN.

Como estamos todos conectados a la red privada con **Tailscale**, tú puedes conectarte por SSH directamente al servidor de Nginx (**CT 103**) y hacer todo el procedimiento sin depender de nadie.

---

## 🛠️ 2. Paso a Paso Autónomo (Lo haces todo tú desde tu laptop)

---

### FASE 1: En el Servidor Nginx (CT 103 vía Tailscale)

1. Abre tu terminal de **PowerShell** en Windows y conéctate por SSH a CT 103:
   ```powershell
   ssh root@192.168.56.103
   ```
   *(Contraseña: `proxmox`)*

2. Una vez dentro de CT 103 (`root@web-proxy:~#`), copia y pega todo este bloque de comandos de una sola vez:

```bash
# 1. Guardar respaldo preventivo de los certificados actuales
mkdir -p /etc/nginx/ssl
[ -f /etc/nginx/ssl/clinica.grupo2.os.crt ] && cp /etc/nginx/ssl/clinica.grupo2.os.crt /etc/nginx/ssl/clinica.grupo2.os.crt.bak_original
[ -f /etc/nginx/ssl/clinica.grupo2.os.key ] && cp /etc/nginx/ssl/clinica.grupo2.os.key /etc/nginx/ssl/clinica.grupo2.os.key.bak_original

# 2. Crear configuración con la lista SAN completa
cat <<'EOF' > /tmp/openssl_san.cnf
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
EOF

# 3. Generar la nueva llave y certificado con SAN (válido por 365 días)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/clinica.grupo2.os.key \
  -out /etc/nginx/ssl/clinica.grupo2.os.crt \
  -config /tmp/openssl_san.cnf

# 4. Ajustar permisos y limpiar
chmod 600 /etc/nginx/ssl/clinica.grupo2.os.key
chmod 644 /etc/nginx/ssl/clinica.grupo2.os.crt
rm -f /tmp/openssl_san.cnf

# 5. Reiniciar Nginx para cargar el nuevo certificado
nginx -t && systemctl restart nginx
echo "✅ Certificado con SAN generado y Nginx reiniciado exitosamente."
```

3. Escribe `exit` para cerrar la sesión SSH de CT 103 y volver a la terminal de tu máquina Windows.

---

### FASE 2: En tu Computadora (Aaron — Cliente Windows)

Ahora que el servidor tiene el nuevo certificado listo:

1. **Descargar el nuevo archivo `.crt` a tu PC:**  
   En tu PowerShell local, ejecuta:
   ```powershell
   scp root@192.168.56.103:/etc/nginx/ssl/clinica.grupo2.os.crt .
   ```
   *(Contraseña: `proxmox`)*

2. **Reinstalarlo en el almacén de confianza de Windows:**  
   Abre una consola de PowerShell como **Administrador** (clic derecho $\rightarrow$ *Ejecutar como administrador*) y escribe:
   ```powershell
   Import-Certificate -FilePath .\clinica.grupo2.os.crt -CertStoreLocation Cert:\LocalMachine\Root
   ```
   *(O haz doble clic sobre el archivo descargado `clinica.grupo2.os.crt` $\rightarrow$ Instalar certificado $\rightarrow$ Equipo local $\rightarrow$ Colocar en: "Entidades de certificación raíz de confianza").*

3. **Reiniciar por completo el navegador:**  
   Cierra todas las ventanas y pestañas abiertas de Google Chrome o Microsoft Edge.

---

## 🧪 3. Sección de Pruebas: ¿Cómo verificar que funcionó?

Abre tu navegador y realiza estas 3 pruebas:

### ✅ Prueba 1: Acceso Oficial por Dominio
* Ingresa a:
  ```text
  https://clinica.grupo2.os
  ```
* **Resultado:** La página carga de inmediato con el **candado de seguridad activo** (sin pantalla roja de advertencia).

---

### ✅ Prueba 2: Acceso Directo por Dirección IP
* En otra pestaña, ingresa a:
  ```text
  https://192.168.56.103
  ```
* **Resultado:** También carga seguro y con candado, porque tu certificado ahora tiene registrada la IP `192.168.56.103` dentro de la lista SAN.

---

### ✅ Prueba 3: Inspección Visual de la Lista SAN
* Haz clic izquierdo en el **candado** junto a la URL $\rightarrow$ **"La conexión es segura"** $\rightarrow$ **"El certificado es válido"**.
* Ve a la pestaña **Detalles** y busca el campo llamado **Nombre alternativo del titular** (*Subject Alternative Name*).
* Verás listados:
  * `DNS Name=clinica.grupo2.os`
  * `DNS Name=*.grupo2.os`
  * `IP Address=192.168.56.103`

---

## 🔄 4. Plan de Reversión (Rollback Autónomo)

Si en algún momento quisieras volver al certificado anterior exactamente como estaba, tú mismo puedes hacerlo en 10 segundos:

1. Conéctate a CT 103:
   ```powershell
   ssh root@192.168.56.103
   ```
2. Pega este comando:
   ```bash
   cp /etc/nginx/ssl/clinica.grupo2.os.crt.bak_original /etc/nginx/ssl/clinica.grupo2.os.crt
   cp /etc/nginx/ssl/clinica.grupo2.os.key.bak_original /etc/nginx/ssl/clinica.grupo2.os.key
   systemctl restart nginx
   echo "🔄 Certificado original restaurado."
   ```
3. Escribe `exit`. Listo.
