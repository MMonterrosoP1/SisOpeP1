# 🔒 Guía Práctica: Blindaje Read-Only de Paciente y Configuración de Usuario Backend SFTP

> **Proyecto:** Sistema Clínico Grupo 2 — Sistemas Operativos I (UMG)  
> **Servidor Destino:** `CT 104` (`mail-sftp`) — IP: `192.168.56.104`  
> **Objetivo Específico:**  
> 1. Crear el usuario exclusivo para la aplicación Next.js (`backend_sftp`) con permisos para depositar recetas y constancias médicas.  
> 2. Convertir la cuenta del paciente (`paciente_sftp`) en **Solo Lectura estricta (`-R`)** para evitar que suba archivos al servidor.  
> 3. Ejecutar las pruebas de verificación que confirmen el bloqueo y la entrega de archivos.  
> **Tiempo Estimado:** 10 a 15 minutos  

---

## 🎯 1. ¿Cómo funciona la arquitectura de seguridad?

En un entorno médico real:
* **El Paciente (`paciente_sftp`):** Únicamente tiene autorización para **descargar** sus documentos. Tiene bloqueada cualquier subida (`put`, `mkdir`, `rm`).
* **El Backend Web (`backend_sftp`):** Es el único servicio automatizado que tiene autorización para **depositar (escribir)** los archivos PDF generados tras las consultas médicas.

```mermaid
graph LR
    NextJS["⚙️ Backend Next.js (CT 102)<br/><i>Usuario: backend_sftp</i>"] -->|1. Deposita constancias (Escritura)| Folder["📂 /paciente_sftp/constancias/"]
    Folder -->|2. Solo descarga (Bandera -R)| Paciente["💻 Paciente (FileZilla / CLI)<br/><i>Usuario: paciente_sftp</i>"]
```

---

## 🔑 2. Datos y Credenciales de Trabajo

| Parámetro | Cuenta de Paciente (Descargas) | Cuenta de Backend (Depósito) |
| :--- | :--- | :--- |
| **Nombre de Usuario:** | `paciente_sftp` | `backend_sftp` |
| **Contraseña:** | `proxmox` | `proxmox1` |
| **Permisos:** | **Solo Lectura (`internal-sftp -R`)** | **Lectura y Escritura (`internal-sftp`)** |
| **Directorio Chroot:** | `/home/sftp/paciente_sftp` | `/home/sftp` |
| **Ruta de los PDFs:** | `/constancias/` | `/paciente_sftp/constancias/` |

---

## 🛠️ 3. Paso a Paso en el Servidor (CT 104)

Conéctate por SSH a **CT 104** desde PowerShell en Windows:
```powershell
ssh root@192.168.56.104
```
*(Contraseña: `proxmox`)*

---

### Paso 1: Crear el usuario exclusivo para Next.js (`backend_sftp`)

Ejecuta los siguientes comandos para dar de alta el usuario en el sistema operativo sin acceso a terminal interactiva:

```bash
# 1. Crear el usuario asignándole el grupo sftp_users y home en /home/sftp
useradd -g sftp_users -d /home/sftp -s /usr/sbin/nologin backend_sftp

# 2. Asignar la contraseña 'proxmox'
echo "backend_sftp:proxmox" | chpasswd
```

---

### Paso 2: Otorgar permisos de escritura grupales en la carpeta `constancias`

Para que el nuevo usuario `backend_sftp` pueda depositar archivos en la carpeta del paciente, le otorgamos permisos de escritura al grupo `sftp_users`:

```bash
# Asignar permisos 775 (Dueño y Grupo pueden escribir; otros solo leer)
chmod 775 /home/sftp/paciente_sftp/constancias
```

Verifica cómo quedaron los permisos ejecutando:
```bash
ls -ld /home/sftp/paciente_sftp/constancias
```
*(Debe mostrar: `drwxrwxr-x ... paciente_sftp sftp_users ... constancias`)*

---

### Paso 3: Configurar OpenSSH con la bandera Read-Only (`-R`) y acceso al Backend

Abre con el editor `nano` el archivo de configuración modular de SFTP:

```bash
nano /etc/ssh/sshd_config.d/sftp.conf
```

Borra el contenido anterior y pega exactamente la siguiente configuración jerárquica:

```text
# ==========================================================
# 1. Regla para el Backend de Next.js (Escritura y depósito)
# ==========================================================
Match User backend_sftp
    ChrootDirectory /home/sftp
    ForceCommand internal-sftp
    X11Forwarding no
    AllowTcpForwarding no
    PasswordAuthentication yes

# ==========================================================
# 2. Regla para Pacientes (Solo Lectura con bandera -R)
# ==========================================================
Match Group sftp_users
    ChrootDirectory /home/sftp/%u
    ForceCommand internal-sftp -R
    X11Forwarding no
    AllowTcpForwarding no
    PasswordAuthentication yes
```

> 📘 **¿Cómo funciona esta jerarquía?:**
> 1. OpenSSH evalúa las reglas de arriba hacia abajo. Cuando se conecta `backend_sftp`, coincide con la primera regla (`Match User backend_sftp`) y le asigna `internal-sftp` estándar con permisos de escritura.
> 2. Cuando se conecta `paciente_sftp`, salta la primera regla y cae en `Match Group sftp_users`. Allí se le aplica la bandera **`-R`** (*Read-Only*), la cual bloquea a nivel de protocolo cualquier comando de subida o modificación.

Guarda los cambios con `Ctrl + O`, presiona `Enter` y sal con `Ctrl + X`.

---

### Paso 4: Validar sintaxis y reiniciar el servidor SSH

Verifica que el archivo no contenga errores tipográficos:
```bash
sshd -t
```
*(Si la salida es silenciosa y no muestra texto, la sintaxis es correcta).*

Aplica la configuración reiniciando el demonio SSH:
```bash
systemctl restart ssh
systemctl is-active ssh
```
*(Debe responder **`active`**).*

---

## 🧪 4. Pruebas de Verificación (Comprobación del Blindaje)

Realiza estas 3 pruebas desde una **nueva ventana de PowerShell en Windows**:

---

### Prueba 1: Comprobar el bloqueo de subida al Paciente (Read-Only)

1. Conéctate con la cuenta del paciente:
   ```powershell
   sftp paciente_sftp@192.168.56.104
   ```
   *(Contraseña: `proxmox`)*

2. Entra a la carpeta de constancias:
   ```text
   sftp> cd constancias
   ```

3. Intenta crear un directorio o subir un archivo de prueba:
   ```text
   sftp> mkdir prueba_paciente
   ```
   * **Resultado esperado:**
     ```text
     remote mkdir ...: Permission denied
     ```
   ¡El servidor rechaza la escritura de inmediato gracias a la bandera `-R`!

4. Sal de la sesión:
   ```text
   sftp> exit
   ```

---

### Prueba 2: Comprobar el depósito de archivos desde el Backend

1. Crea un archivo local de prueba en tu máquina:
   ```powershell
   Set-Content -Path .\receta_medica_001.txt -Value "Constancia Medica de Prueba - Grupo 2 UMG"
   ```

2. Conéctate con la cuenta de servicio de Next.js:
   ```powershell
   sftp backend_sftp@192.168.56.104
   ```
   *(Contraseña: `proxmox`)*

3. Navega hacia la carpeta del paciente y deposita el archivo:
   ```text
   sftp> cd paciente_sftp/constancias
   sftp> put receta_medica_001.txt
   ```
   * **Resultado esperado:**
     ```text
     Uploading receta_medica_001.txt to /paciente_sftp/constancias/receta_medica_001.txt
     receta_medica_001.txt 100% 46 ...
     ```
   ¡El backend pudo depositar el archivo con éxito total!

4. Sal de la sesión:
   ```text
   sftp> exit
   ```

---

### Prueba 3: Comprobar que el Paciente pueda leer y descargar el archivo

1. Vuelve a entrar con la cuenta del paciente:
   ```powershell
   sftp paciente_sftp@192.168.56.104
   ```
   *(Contraseña: `proxmox`)*

2. Verifica y descarga la constancia:
   ```text
   sftp> cd constancias
   sftp> ls
   receta_medica_001.txt
   sftp> get receta_medica_001.txt
   ```
   * **Resultado esperado:**
     ```text
     Fetching /constancias/receta_medica_001.txt to receta_medica_001.txt
     receta_medica_001.txt 100% 46 ...
     ```
   El paciente puede listar y descargar perfectamente el documento emitido por la clínica.

3. Sal de la sesión:
   ```text
   sftp> exit
   ```

---

## 🔄 5. Parámetros para la Integración con Next.js (`CT 102`)

Para que el backend en Next.js se conecte y deposite los PDFs generados:

### 1. Variables en `/var/www/proyecto-grupo2/.env`:
```env
SFTP_HOST="192.168.56.104"
SFTP_PORT=22
SFTP_USER="backend_sftp"
SFTP_PASS="proxmox1"
```

### 2. Snippet de Código TypeScript (`ssh2-sftp-client`):
```typescript
import Client from "ssh2-sftp-client";

export async function uploadMedicalDocument(patientUsername: string, filename: string, buffer: Buffer) {
  const sftp = new Client();
  try {
    await sftp.connect({
      host: process.env.SFTP_HOST || "192.168.56.104",
      port: Number(process.env.SFTP_PORT) || 22,
      username: process.env.SFTP_USER || "backend_sftp",
      password: process.env.SFTP_PASS || "proxmox1"
    });

    // Ruta absoluta en la jaula del backend
    const remotePath = `/${patientUsername}/constancias/${filename}`;
    await sftp.put(buffer, remotePath);
  } finally {
    await sftp.end();
  }
}
```
