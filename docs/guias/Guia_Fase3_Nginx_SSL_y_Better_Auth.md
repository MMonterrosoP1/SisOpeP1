# 🔒 Guía Paso a Paso: Despliegue de Nginx Reverse Proxy, SSL y Configuración de Better Auth (Fase 3)

> **Curso:** Sistemas Operativos I — UMG 2026  
> **Proyecto:** Sistema Clínico Grupo 2 (`grupo2.os`)  
> **Nivel de Dificultad:** Principiante / Intermedio  
> **Servidores Involucrados:**  
> • **CT 103 (`192.168.56.103`):** Web Proxy & Terminación SSL Nginx  
> • **CT 102 (`192.168.56.102`):** Servidor de Aplicación Next.js (PM2 en puerto 3000)  
> **Tiempo Estimado:** 15 a 20 minutos  

---

## 🎯 1. ¿Qué vamos a hacer y por qué? (Concepto Básico)

Actualmente la aplicación Next.js ya está funcionando en el puerto `3000` de **CT 102**, pero presenta dos problemas:
1. **Falta de Seguridad:** No tiene cifrado SSL/HTTPS ni está en los puertos web estándar (`80` / `443`).
2. **Error de Autenticación en Better Auth:** En los registros aparece `ERROR [Better Auth]: Invalid origin: http://192.168.56.102:3000`. La biblioteca de seguridad rechaza las solicitudes porque espera que los usuarios ingresen a través del dominio oficial (`https://clinica.grupo2.os`).

Para resolver esto, implementaremos la arquitectura oficial del proyecto:

```mermaid
graph LR
    User["💻 Usuario / Navegador<br/><b>https://clinica.grupo2.os</b>"] -->|Puerto 443 (HTTPS Cifrado)| Nginx["🔒 CT 103: Nginx Proxy Inverso<br/><i>(Descifra el SSL y añade cabeceras)</i>"]
    Nginx -->|proxy_pass http://192.168.56.102:3000| NextJS["⚙️ CT 102: Next.js (PM2)<br/><i>(Better Auth valida clinica.grupo2.os)</i>"]
```

---

## 🔑 2. Resumen de Credenciales y Direccionamiento

| Servidor / Servicio | IP Estática | Rol | Usuario | Contraseña |
| :--- | :---: | :--- | :---: | :---: |
| **CT 103** | `192.168.56.103` | Nginx Reverse Proxy + SSL | `root` | `proxmox` |
| **CT 102** | `192.168.56.102` | App Server Next.js (PM2) | `root` | `proxmox` |
| **DNS (CT 101)** | `192.168.56.101` | Resuelve `clinica.grupo2.os` | — | — |

---

## 🛠️ PARTE 1: Configurar Nginx y Certificados SSL en CT 103

### Paso 1.1: Conectarse por SSH a CT 103
Abre una terminal de **PowerShell** en tu computadora e ingresa a CT 103:

```powershell
ssh root@192.168.56.103
```
*(Ingresa la contraseña: `proxmox`)*

---

### Paso 1.2: Instalar Nginx y OpenSSL
Ejecuta el siguiente comando para actualizar paquetes e instalar las herramientas necesarias:

```bash
apt-get update -y && apt-get install -y nginx openssl
```

---

### Paso 1.3: Generar el Certificado SSL Autofirmado
Crearemos una carpeta segura para los certificados y generaremos un par de llaves criptográficas (válidas por 365 días) para el dominio `clinica.grupo2.os`:

```bash
# 1. Crear carpeta de certificados
mkdir -p /etc/nginx/ssl

# 2. Generar llave privada y certificado X.509
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/clinica.grupo2.os.key \
  -out /etc/nginx/ssl/clinica.grupo2.os.crt \
  -subj "/CN=clinica.grupo2.os/O=Clinica Grupo 2/C=GT"

# 3. Proteger los permisos de la llave privada
chmod 600 /etc/nginx/ssl/clinica.grupo2.os.key
chmod 644 /etc/nginx/ssl/clinica.grupo2.os.crt
```

---

### Paso 1.4: Configurar el Servidor Virtual en Nginx
Crearemos la configuración del sitio para que:
1. Todo tráfico por `HTTP` (puerto `80`) se redirija automáticamente a `HTTPS` (puerto `443`).
2. En `HTTPS`, Nginx entregue el certificado SSL y redirija el tráfico internamente hacia `http://192.168.56.102:3000`.
3. Se envíen las cabeceras `X-Forwarded-Proto https` y `X-Forwarded-Host` para que Better Auth sepa que la conexión es segura.

Copia y pega el siguiente bloque completo en la terminal:

```bash
cat << 'EOF' > /etc/nginx/sites-available/clinica.grupo2.os
# Bloque 1: Redirección automática HTTP (80) -> HTTPS (443)
server {
    listen 80;
    listen [::]:80;
    server_name clinica.grupo2.os portal.grupo2.os web.grupo2.os tienda.grupo2.os;
    return 301 https://$host$request_uri;
}

# Bloque 2: Servidor Seguro HTTPS (443) con Reverse Proxy hacia CT 102
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name clinica.grupo2.os portal.grupo2.os web.grupo2.os tienda.grupo2.os;

    # Certificados SSL
    ssl_certificate /etc/nginx/ssl/clinica.grupo2.os.crt;
    ssl_certificate_key /etc/nginx/ssl/clinica.grupo2.os.key;

    # Protocolos y Cifrados Seguros
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Tamaño máximo para subida de constancias/archivos
    client_max_body_size 25M;

    location / {
        # Dirección interna del servidor de Next.js en CT 102
        proxy_pass http://192.168.56.102:3000;

        # Configuración de Proxy HTTP/1.1 y WebSockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';

        # Cabeceras requeridas para Next.js y Better Auth
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Forwarded-Port 443;

        proxy_cache_bypass $http_upgrade;
    }
}
EOF
```

---

### Paso 1.5: Activar el sitio y reiniciar Nginx
Ejecuta los siguientes comandos para habilitar el sitio y verificar que no haya errores de sintaxis:

```bash
# 1. Crear enlace simbólico para activar el sitio
ln -sf /etc/nginx/sites-available/clinica.grupo2.os /etc/nginx/sites-enabled/

# 2. Desactivar el sitio default de bienvenida de Nginx
rm -f /etc/nginx/sites-enabled/default

# 3. Probar la sintaxis de Nginx (debe decir: syntax is ok / test is successful)
nginx -t

# 4. Reiniciar y habilitar Nginx en el arranque del sistema
systemctl restart nginx
systemctl enable nginx
```

> [!TIP]
> Si `nginx -t` responde `nginx: configuration file /etc/nginx/nginx.conf test is successful`, la configuración de Nginx está perfecta.

Sal de la terminal de CT 103:
```bash
exit
```

---

## ⚙️ PARTE 2: Actualizar Better Auth y Reiniciar Next.js en CT 102

Ahora debemos indicarle a la aplicación Next.js cuál es su nuevo dominio oficial con HTTPS para que acepte los inicios de sesión.

### Paso 2.1: Conectarse por SSH a CT 102
Desde PowerShell en Windows:

```powershell
ssh root@192.168.56.102
```
*(Ingresa la contraseña: `proxmox`)*

---

### Paso 2.2: Actualizar el archivo `.env`
El archivo de entorno está en `/var/www/proyecto-grupo2/.env`. Vamos a crear un respaldo y actualizar las variables `BETTER_AUTH_URL` y `BETTER_AUTH_TRUSTED_ORIGINS`.

Ejecuta:

```bash
# 1. Crear respaldo preventivo
cp /var/www/proyecto-grupo2/.env /var/www/proyecto-grupo2/.env.backup

# 2. Reemplazar BETTER_AUTH_URL con el dominio HTTPS oficial
sed -i 's|^BETTER_AUTH_URL=.*|BETTER_AUTH_URL="https://clinica.grupo2.os"|g' /var/www/proyecto-grupo2/.env

# 3. Actualizar la lista de orígenes de confianza (Trusted Origins)
sed -i 's|^BETTER_AUTH_TRUSTED_ORIGINS=.*|BETTER_AUTH_TRUSTED_ORIGINS="https://clinica.grupo2.os,http://clinica.grupo2.os,http://192.168.56.102:3000,http://localhost:3000"|g' /var/www/proyecto-grupo2/.env
```

Para verificar que los cambios quedaron aplicados correctamente, ejecuta:
```bash
head -n 10 /var/www/proyecto-grupo2/.env
```

Deberás ver:
```env
BETTER_AUTH_URL="https://clinica.grupo2.os"
BETTER_AUTH_TRUSTED_ORIGINS="https://clinica.grupo2.os,http://clinica.grupo2.os,http://192.168.56.102:3000,http://localhost:3000"
```

---

### Paso 2.3: Reiniciar el proceso en PM2 con `--update-env`

> [!IMPORTANT]
> En PM2, un simple `pm2 restart` mantiene en memoria las variables viejas. Para forzar la lectura del nuevo `.env`, es **obligatorio** usar la bandera `--update-env`.

Ejecuta en CT 102:

```bash
# Cargar el entorno de Node/pnpm y reiniciar PM2
export PATH=$PATH:/root/.nvm/versions/node/v24.20.0/bin
pm2 restart clinica --update-env
```

Verifica que el estado siga en `online`:
```bash
pm2 status
```

Sal de la terminal de CT 102:
```bash
exit
```

---

## 🧪 PARTE 3: Pruebas de Verificación

Desde PowerShell en tu computadora con Windows (o con navegador web):

### Prueba 1: Verificar la redirección de HTTP a HTTPS
Ejecuta en PowerShell:
```powershell
curl -I http://clinica.grupo2.os
```
* **Resultado Esperado:** `HTTP/1.1 301 Moved Permanently` con cabecera `Location: https://clinica.grupo2.os/`.

---

### Prueba 2: Verificar la respuesta HTTPS segura
Ejecuta en PowerShell:
```powershell
curl -k -I https://clinica.grupo2.os
```
*(La bandera `-k` permite omitir la alerta del certificado autofirmado en la consola).*
* **Resultado Esperado:** `HTTP/2 200` o `HTTP/1.1 200 OK`.

---

### Prueba 3: Probar en el Navegador Web
1. Abre tu navegador (Google Chrome, Firefox o Edge).
2. Ingresa a: **`https://clinica.grupo2.os`**
3. El navegador te advertirá sobre el certificado autofirmado:
   * En Chrome/Edge: haz clic en **"Configuración avanzada"** $\rightarrow$ **"Continuar a clinica.grupo2.os (no seguro)"**.
4. ¡El portal **PREMED | Gestión Clínica Médica** cargará de inmediato bajo HTTPS!
5. Intenta iniciar sesión o registrar un usuario.

---

### Prueba 4: Verificar que el error de Better Auth desapareció
Conéctate nuevamente a CT 102:
```powershell
ssh root@192.168.56.102
```
Revisa las últimas líneas de error:
```bash
export PATH=$PATH:/root/.nvm/versions/node/v24.20.0/bin
pm2 logs clinica --lines 20 --nostream
```
* **Resultado Esperado:** Ya **NO** deben aparecer nuevos registros de `ERROR [Better Auth]: Invalid origin: http://192.168.56.102:3000`. Toda autenticación a través de `https://clinica.grupo2.os` será validada exitosamente.

---

## 🚨 Solución de Problemas Frecuentes (Troubleshooting)

| Síntoma | Causa Probable | Solución |
| :--- | :--- | :--- |
| `nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)` | Otro servicio (como Apache o Python) está usando el puerto 80 en CT 103. | Ejecuta `ss -tulpn \| grep :80` para ver qué proceso es, o `systemctl stop apache2`. |
| El navegador dice `DNS_PROBE_FINISHED_NXDOMAIN` al escribir `clinica.grupo2.os`. | Tu tarjeta de red en Windows no tiene como DNS primario a `192.168.56.101`. | Agrega `192.168.56.103 clinica.grupo2.os` en tu archivo `C:\Windows\System32\drivers\etc\hosts` de Windows. |
| La página carga pero da error `502 Bad Gateway`. | Nginx no logra comunicarse con el puerto 3000 de CT 102. | Verifica que la app esté corriendo en CT 102 (`curl http://192.168.56.102:3000`). |
| Sigue saliendo `Invalid origin` al hacer login. | PM2 no recargó las variables de entorno del archivo `.env`. | En CT 102 ejecuta: `pm2 restart clinica --update-env`. |
