# 🔒 Guía Técnica: Instalación del Certificado SSL/TLS en Clientes (Windows y Linux)
> **Curso:** Sistemas Operativos I — Universidad Mariano Gálvez de Guatemala  
> **Proyecto:** Sistema Integral de Gestión Clínica y Expedientes Médicos Seguros  
> **Grupo Asignado:** Grupo 2 (`grupo2.os`)  
> **Dominio Seguro:** `https://clinica.grupo2.os` | Servidor Web: CT 103 (`192.168.56.103`)  

---

## 🧠 1. Fundamentos Teóricos: ¿Por qué ocurre la alerta de "No Seguro"?

### A. La Cadena de Confianza y OpenSSL
Los navegadores modernos (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari) validan los certificados SSL/TLS mediante una **Cadena de Confianza (*Chain of Trust*)**:

1. Todos los sistemas operativos y navegadores vienen de fábrica con un **Almacén de Entidades Emisoras Raíz de Confianza** (*Root CA Store*).
2. En este almacén residen los certificados raíz de entidades públicas auditadas a nivel mundial (ej. *DigiCert, Sectigo, GlobalSign, Let's Encrypt*).
3. Cuando un servidor web entrega un certificado firmado por **OpenSSL** de forma local o autofirmada (como en nuestro proyecto), el canal de transporte **está 100% cifrado con algoritmos de grado militar (TLSv1.3 con AES-256)**. Sin embargo, el navegador emite la alerta `NET::ERR_CERT_AUTHORITY_INVALID` o `SEC_ERROR_UNKNOWN_ISSUER` porque la **Autoridad Certificadora (CA)** que firmó el certificado no está en su lista preinstalada de entidades mundiales.
4. **En resumen:** El cifrado existe y es matemáticamente inviolable, pero el navegador avisa que la identidad no ha sido avalada por un tercero comercial.

---

### B. ¿Por qué con Let's Encrypt no aparece la alerta?
* **Let's Encrypt** es una Autoridad Certificadora pública y abierta reconocida por el consorcio CA/Browser Forum.
* Su certificado raíz (**ISRG Root X1**) está preinstalado de fábrica en Windows, Linux, Android, iOS y macOS.
* Cuando Let's Encrypt emite un certificado, el navegador valida la firma criptográfica contra su propio almacén preinstalado, la cadena se completa hasta una raíz confiable y muestra el candado verde/seguro de inmediato sin intervención del usuario.

---

### C. ¿Por qué Let's Encrypt NO era viable en nuestro proyecto?
Para emitir un certificado, Let's Encrypt utiliza el protocolo automatizado **ACME** (*Automated Certificate Management Environment*), el cual valida la propiedad del dominio mediante desafíos (*challenges*). En nuestra arquitectura fue inviable por tres razones técnicas de redes y DNS:

1. **Dominio con TLD No Público (`.os`):**  
   Let's Encrypt **únicamente emite certificados para dominios de primer nivel (TLD) públicos reconocidos por la ICANN** (ej. `.com`, `.org`, `.edu.gt`). La extensión `.os` es un pseudo-TLD ficticio y privado de uso estrictamente académico en el aula. Las entidades públicas no pueden validar ni firmar dominios no delegados en los servidores raíz mundiales de Internet.
2. **Subred Privada RFC 1918 sin IP Pública (`192.168.56.0/24`):**  
   El desafío estándar **HTTP-01** de Let's Encrypt exige que sus servidores de validación (ubicados en Internet pública) se conecten por el puerto 80 a `http://clinica.grupo2.os/`. Al ser una red interna aislada detrás de OPNsense y NAT sin una dirección IP pública estática enrutada globalmente, los servidores de Let's Encrypt no tienen forma de alcanzar nuestro contenedor CT 103.
3. **Servidor DNS Autoritativo Local (BIND9 en CT 101):**  
   El desafío alternativo **DNS-01** requiere publicar registros `TXT` (`_acme-challenge`) en servidores DNS públicos consultables desde cualquier parte del mundo. Nuestro servidor DNS BIND9 solo responde dentro del switch físico y virtual del laboratorio.

> [!NOTE]
> **Estándar de la Industria:** En entornos corporativos, redes gubernamentales, infraestructuras militares o bancos con redes aisladas (*air-gapped*), el procedimiento oficial **no es Let's Encrypt**, sino desplegar una **PKI Privada (Autoridad Certificadora Local con OpenSSL o Active Directory Certificate Services)** e instalar el certificado raíz en los dispositivos autorizados de la empresa. Eso es exactamente lo que implementamos.

---

## 📥 2. Obtención del Archivo de Certificado (`clinica.grupo2.os.crt`)

Antes de instalarlo en el cliente, obtén el archivo público `.crt` usando cualquiera de estos métodos:

### Método A: Extracción directa desde la Terminal (Recomendado)
Desde la computadora cliente (conectada a la red del Grupo 2):
```bash
# Opción 1: Vía SCP desde CT 103 (Contraseña: proxmox)
scp root@192.168.56.103:/etc/nginx/ssl/clinica.grupo2.os.crt .

# Opción 2: Extracción en vivo mediante OpenSSL cliente
openssl s_client -showcerts -connect clinica.grupo2.os:443 </dev/null 2>/dev/null | openssl x509 -outform PEM > clinica.grupo2.os.crt
```

### Método B: Descarga desde el Navegador Web
1. Entrar a `https://clinica.grupo2.os`.
2. Hacer clic en el aviso rojo **"No es seguro"** junto a la URL.
3. Clic en **"El certificado no es válido"** $\rightarrow$ pestaña **Detalles**.
4. Clic en **Exportar...** y guardar el archivo como `clinica.grupo2.os.crt`.

---

## 🪟 3. Instalación en Clientes Windows (Chrome, Edge, Sistema)

### Opción A: Vía PowerShell como Administrador (10 Segundos)
Abre PowerShell con clic derecho $\rightarrow$ **Ejecutar como administrador** y corre:

```powershell
Import-Certificate -FilePath ".\clinica.grupo2.os.crt" -CertStoreLocation "Cert:\LocalMachine\Root"
```

*Verificación:* Deberá devolver una salida con el `Thumbprint` y el Subject `CN=clinica.grupo2.os`. Cierra el navegador y vuelve a abrirlo: el candado aparecerá seguro sin alertas.

---

### Opción B: Vía Interfaces Gráficas en Windows

En Windows tienes 3 interfaces gráficas distintas según tu preferencia:

#### 1. Mediante el "Asistente para Importación de Certificados" (Explorador de Archivos)
Esta es la interfaz gráfica predeterminada que Windows abre al interactuar con el archivo:
1. Abre el **Explorador de Archivos de Windows** y localiza el archivo `clinica.grupo2.os.crt`.
2. Haz doble clic sobre él (o clic derecho $\rightarrow$ **Instalar certificado**). Se abrirá la ventana del **Visor de certificados de Windows**.
3. En la pestaña *General*, haz clic en el botón **Instalar certificado...**. Se iniciará el **Asistente para importación de certificados**.
4. En *Ubicación del almacén*, selecciona:
   * **Equipo local** (Aplica para todos los usuarios de la PC, requiere permisos de administrador).
   * O *Usuario actual* (Aplica solo a tu sesión de Windows).
   * Presiona **Siguiente**.
5. Marca la casilla: **Colocar todos los certificados en el siguiente almacén**.
6. Haz clic en el botón **Examinar...** y, en la pequeña ventana emergente, selecciona la carpeta:  
   📂 **Entidades de certificación raíz de confianza** (*Trusted Root Certification Authorities*).
7. Presiona **Aceptar** $\rightarrow$ **Siguiente** $\rightarrow$ **Finalizar**.
8. Windows mostrará el mensaje: *"La importación se completó correctamente"*.
9. Reinicia Google Chrome o Microsoft Edge. Al ingresar a `https://clinica.grupo2.os`, el candado de seguridad aparecerá activo.

---

#### 2. Mediante la Consola de Certificados de Windows (`certlm.msc` / `certmgr.msc`)
Esta es la interfaz gráfica administrativa nativa de Windows (Microsoft Management Console):
1. Presiona la combinación de teclas `Windows + R` en tu teclado.
2. Escribe:
   * **`certlm.msc`** (para gestionar los certificados de todo el equipo local como Administrador), o bien
   * **`certmgr.msc`** (para gestionar los certificados de tu usuario actual).
3. Presiona `Enter`. Se abrirá la ventana de la consola **Certificados**.
4. En el panel izquierdo, despliega la carpeta **Entidades de certificación raíz de confianza**.
5. Haz clic derecho sobre la subcarpeta **Certificados** $\rightarrow$ selecciona **Todas las tareas** $\rightarrow$ **Importar...**.
6. Se abrirá el Asistente: presiona **Siguiente**, busca y selecciona tu archivo `clinica.grupo2.os.crt`, presiona **Siguiente** y confirma con **Finalizar**.

---

#### 3. Mediante la Configuración Gráfica de Google Chrome o Microsoft Edge
Si prefieres no usar el Explorador de Windows y hacerlo desde el propio navegador:
* **En Google Chrome:**
  1. En la barra de direcciones escribe: `chrome://settings/certificates` y presiona Enter.
  2. Haz clic en **Administrar certificados del dispositivo** (o *Administrar certificados de Windows*). Se abrirá la ventana gráfica del sistema.
  3. Ve a la pestaña **Entidades de certificación raíz de confianza** $\rightarrow$ haz clic en **Importar...** y selecciona el archivo `.crt`.
* **En Microsoft Edge:**
  1. Escribe en la barra de URL: `edge://settings/privacy` $\rightarrow$ desplázate hacia abajo hasta la sección **Seguridad**.
  2. Haz clic en **Administrar certificados** $\rightarrow$ pestaña **Entidades de certificación raíz de confianza** $\rightarrow$ **Importar...**.

---

### Configuración Adicional para Mozilla Firefox en Windows
*Mozilla Firefox utiliza su propio almacén de certificados independiente de Windows.*
* **Paso rápido:** En la barra de direcciones de Firefox escribe `about:config`, presiona *Aceptar el riesgo y continuar*, busca la clave:
  ```text
  security.enterprise_roots.enabled
  ```
  y cámbiala a **`true`**. Con esto Firefox leerá automáticamente el certificado recién instalado en Windows.

---

## 🐧 4. Instalación en Clientes Linux (Debian, Ubuntu, Arch, Fedora)

### A. Distribuciones basadas en Debian / Ubuntu / Linux Mint
Ejecuta en la terminal:

```bash
# 1. Copiar el certificado a la carpeta de certificados de confianza del sistema
sudo cp clinica.grupo2.os.crt /usr/local/share/ca-certificates/clinica.grupo2.os.crt

# 2. Actualizar el almacén de certificados SSL del sistema operativo
sudo update-ca-certificates

# 3. Validar que las herramientas CLI (curl, git, etc.) ya lo reconocen sin alertas
curl -I https://clinica.grupo2.os
```
*(La respuesta de curl debe devolver `HTTP/2 200` o `HTTP/1.1 200 OK` sin requerir el parámetro `-k`).*

---

### B. Distribuciones Fedora / RHEL / CentOS / Rocky Linux
```bash
# 1. Copiar al directorio de anclas de confianza
sudo cp clinica.grupo2.os.crt /etc/pki/ca-trust/source/anchors/

# 2. Regenerar el almacén de CA
sudo update-ca-trust

# 3. Validar con curl
curl -I https://clinica.grupo2.os
```

---

### C. Distribuciones Arch Linux / Manjaro
```bash
# 1. Importar y actualizar el almacén
sudo trust anchor --store clinica.grupo2.os.crt
sudo update-ca-trust

# 2. Validar con curl
curl -I https://clinica.grupo2.os
```

---

### D. Navegadores Chromium / Google Chrome en Linux (NSS DB)
En algunas distribuciones de Linux, Chrome/Brave/Chromium no leen automáticamente el almacén `/etc/ssl/certs` del sistema, sino la base de datos NSS del usuario. Para agregarlo directamente:

```bash
# Instalar utilidades de NSS si no están presentes
sudo apt install libnss3-tools -y  # En Debian/Ubuntu
# sudo dnf install nss-tools -y    # En Fedora

# Agregar el certificado a la base de datos de Chrome
certutil -d sql:$HOME/.pki/nssdb -A -t "C,," -n "Clinica Grupo 2" -i clinica.grupo2.os.crt
```

---

## 🧪 5. Comprobación Final de la Demostración

Una vez instalado en la computadora cliente:
1. Abre el navegador e ingresa a: `https://clinica.grupo2.os`.
2. Haz clic en el icono del **candado seguro**:
   * En Chrome/Edge: dirá **"La conexión es segura"**.
   * En *Detalles del certificado*: mostrará que la Autoridad Emisora es **`Clinica Grupo 2`** con validez de 365 días y protocolo **TLSv1.3**.
3. Demuestra al catedrático que en entornos corporativos cerrados, la distribución de certificados mediante políticas de confianza local (o GPO) es el procedimiento estándar de seguridad de la información.

---

## 🚨 6. Solución al Error `net::ERR_CERT_COMMON_NAME_INVALID`

Si tras instalar el certificado en Windows o Linux, el navegador deja de mostrar `ERR_CERT_AUTHORITY_INVALID` pero ahora muestra:
```text
net::ERR_CERT_COMMON_NAME_INVALID
```

### ¿Por qué ocurre?
1. **Falta de la extensión SAN (*Subject Alternative Name*):** Desde Chrome 58 y en versiones modernas de Microsoft Edge y Firefox, los navegadores **ignoran por completo el campo antiguo `Common Name` (CN)** y exigen obligatoriamente la extensión estándar RFC 2818 `Subject Alternative Name`. Si el certificado solo tiene `/CN=clinica.grupo2.os` sin la sección `X509v3 Subject Alternative Name`, el navegador rechaza la coincidencia del host.
2. **Acceso por Dirección IP:** Si el usuario ingresó escribiendo `https://192.168.56.103` en lugar del dominio `https://clinica.grupo2.os`, el certificado será rechazado a menos que la IP esté explícitamente declarada en el bloque SAN.

### Solución en 1 Paso (Regenerar en CT 103 con script):
En el Host Proxmox (`192.168.56.100`), ejecuta:
```bash
bash /vagrant/24_regenerate_ssl_with_san.sh
```
*Este script regenera la llave y el certificado inyectando en el bloque SAN:*
* `DNS:clinica.grupo2.os`
* `DNS:*.grupo2.os` (Wildcard para cualquier subdominio)
* `DNS:portal.grupo2.os`
* `IP:192.168.56.103` (Permite entrar directamente por IP sin error)

Luego, vuelve a descargar el certificado actualizado en el cliente y reinstálalo con el comando de PowerShell:
```powershell
Import-Certificate -FilePath .\clinica.grupo2.os.crt -CertStoreLocation Cert:\LocalMachine\Root
```
Reinicia el navegador e ingresa nuevamente: el candado aparecerá activo y seguro.
