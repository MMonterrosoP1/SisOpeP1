# 📥 Guía Práctica de Aprendizaje: Instalación y Configuración Manual de Dovecot IMAP en CT 104

> **Proyecto:** Sistema Clínico Grupo 2 — Sistemas Operativos I (UMG)  
> **Servidor Destino:** `CT 104` (`mail-sftp`) — IP: `192.168.56.104`  
> **Responsable:** Integrante del módulo de servicios de red y correo  
> **Objetivo:** Adquirir experiencia práctica configurando un servidor MDA/IMAP en Linux  
> **Tiempo Estimado:** 20 a 25 minutos  

---

## 🎯 1. ¿Qué vamos a aprender y construir en esta práctica?

En un entorno de servidores de correo profesional existen dos roles claramente separados:
1. **El MTA (*Mail Transfer Agent*):** Ya tenemos instalado **Postfix** en el puerto `25`. Su único trabajo es recibir correos y dejarlos físicamente guardados en el disco duro del servidor dentro de la carpeta `/home/paciente/Maildir/`.
2. **El MDA / Servidor IMAP (*Mail Delivery Agent*):** Postfix no sabe cómo mostrarle esos correos a un usuario. Aquí entra **Dovecot**, el cual abrirá el puerto de red `143` para que un programa visual (como **Mozilla Thunderbird** en Windows) pueda conectarse, autenticarse y listar la bandeja de entrada.

```mermaid
graph LR
    NextJS["⚙️ Backend Web / API"] -->|1. Envía correo (SMTP :25)| Postfix["📧 Postfix (CT 104)"]
    Postfix -->|2. Escribe archivo físico| Maildir["📁 /home/paciente/Maildir/"]
    Maildir -->|3. Lee archivos del buzón| Dovecot["📥 Dovecot IMAP (:143)"]
    Dovecot -->|4. Entrega a la aplicación| Thunderbird["💻 Thunderbird en Windows"]
```

Al completar esta guía habrás configurado desde cero el servicio IMAP en Debian Linux, editado sus archivos de configuración del sistema y conectado un cliente nativo en tu computadora.

---

## 🔑 2. Datos de Acceso y Credenciales

* **Servidor de Correo (CT 104):** `192.168.56.104` (o `mail.grupo2.os`)
* **Puerto IMAP estándar:** `143`
* **Contraseña maestra de administración:** `proxmox`
* **Cuentas ya creadas en el sistema para pruebas:**
  * Usuario: `paciente` | Contraseña: `proxmox`
  * Usuario: `medico` | Contraseña: `proxmox`

---

## 🛠️ 3. Paso a Paso Manual (Comandos y Configuración)

Sigue cada uno de estos pasos directamente en la consola para completar la instalación.

---

### Paso 1: Conectarse por SSH al contenedor de correo (CT 104)
Abre **PowerShell** o **Terminal** en tu computadora con Windows y conéctate al contenedor CT 104:

```powershell
ssh root@192.168.56.104
```

* El sistema te solicitará la contraseña: escribe `proxmox` y presiona `Enter`.
* Notarás que el indicador de la terminal cambia a:
  ```text
  root@mail-sftp:~#
  ```
*(Esto confirma que ya estás dentro del servidor de correo).*

---

### Paso 2: Instalar el paquete `dovecot-imapd`
Actualiza el repositorio de paquetes de Debian e instala el demonio IMAP:

```bash
apt-get update -y
apt-get install -y dovecot-imapd
```

> 📘 **¿Qué hace esto?:** Descarga e instala los binarios de Dovecot encargados de gestionar las conexiones IMAP y la autenticación del sistema operativo.

---

### Paso 3: Configurar la ruta de almacenamiento de los buzones
Dovecot necesita saber exactamente en qué formato y carpeta guardó Postfix los correos. En nuestro sistema usamos el formato moderno **Maildir** en el directorio de cada usuario (`/home/<usuario>/Maildir/`).

Edita el archivo de configuración con el editor `nano`:
```bash
nano /etc/dovecot/conf.d/10-mail.conf
```

1. Presiona `Ctrl + W` para buscar el texto: `mail_location =`
2. Verás una línea comentada con `#`. Cámbiala para que quede exactamente así:
   ```text
   mail_location = maildir:~/Maildir
   ```
3. Guarda el archivo: presiona `Ctrl + O`, luego `Enter`.
4. Sal del editor: presiona `Ctrl + X`.

---

### Paso 4: Permitir autenticación en red local interna
Por defecto, Dovecot bloquea inicios de sesión que no usen certificados SSL externos. Debido a que estamos trabajando en una red privada de pruebas (`192.168.56.0/24`), debemos indicarle que acepte credenciales en texto plano dentro del segmento local.

Edita el archivo de autenticación:
```bash
nano /etc/dovecot/conf.d/10-auth.conf
```

1. Presiona `Ctrl + W` y busca: `disable_plaintext_auth`
2. Descomenta la línea eliminando el `#` y cámbiala a:
   ```text
   disable_plaintext_auth = no
   ```
3. Guarda (`Ctrl + O`, luego `Enter`) y sal (`Ctrl + X`).

---

### Paso 5: Reiniciar y habilitar el servicio Dovecot
Aplica los cambios en el sistema operativo reiniciando el servicio, y configúralo para que arranque automáticamente si se reinicia la máquina:

```bash
systemctl restart dovecot
systemctl enable dovecot
```

Para verificar que el servicio esté activo y en ejecución sin errores, revisa su estado:
```bash
systemctl status dovecot --no-pager
```
*(Debes ver un texto en verde que dice **`active (running)`**).*

---

### Paso 6: Validar que el puerto 143 esté escuchando conexiones
Ejecuta el siguiente comando para listar los sockets de red activos en el contenedor:

```bash
ss -tulpn | grep 143
```

**Salida esperada:**
```text
tcp   LISTEN 0 100 0.0.0.0:143 0.0.0.0:* users:(("dovecot",pid=...,fd=...))
```
Si ves `0.0.0.0:143`, **el servidor IMAP ya está listo y esperando clientes**. 🎉

---

## 💻 4. Conexión del Cliente en Windows (Mozilla Thunderbird)

Ahora conectaremos un cliente visual en tu computadora física para leer la bandeja de entrada como lo haría un usuario real.

1. **Instalar el cliente:**
   * Si no lo tienes instalado, descarga **Mozilla Thunderbird** gratis desde: [thunderbird.net](https://www.thunderbird.net/)
2. **Crear una cuenta de correo:**
   * Abre Thunderbird.
   * Ve a **Ajustes de cuenta** $\rightarrow$ **Acciones de cuenta** $\rightarrow$ **Añadir cuenta de correo...**
   * Llena los datos iniciales:
     * **Nombre completo:** `Paciente Demo`
     * **Dirección de correo:** `paciente@grupo2.os`
     * **Contraseña:** `proxmox`
     * Deja marcada la opción *Recordar contraseña*.
   * **MUY IMPORTANTE:** Haz clic en el botón **Configurar manualmente** ubicado en la parte inferior.
3. **Ingresar los parámetros de conexión exactos:**

| Sección | Parámetro | Valor a Configurar |
| :--- | :--- | :--- |
| **Servidor ENTRANTE (IMAP)** | **Protocolo:** | `IMAP` |
| | **Nombre del servidor:** | `192.168.56.104` *(o mail.grupo2.os)* |
| | **Puerto:** | `143` |
| | **Seguridad de la conexión:** | `Ninguna` *(None)* |
| | **Método de autenticación:** | `Contraseña normal` |
| | **Nombre de usuario:** | `paciente` |
| **Servidor SALIENTE (SMTP)** | **Nombre del servidor:** | `192.168.56.104` *(o mail.grupo2.os)* |
| | **Puerto:** | `25` |
| | **Seguridad de la conexión:** | `Ninguna` *(None)* |
| | **Método de autenticación:** | `Sin autenticación` |
| | **Nombre de usuario:** | *(Dejar vacío o paciente)* |

4. Haz clic en **Volver a probar** y luego en **Hecho**.
5. Thunderbird te mostrará una advertencia indicando que la conexión a la IP local no utiliza cifrado SSL. Marca la casilla **"Entiendo los riesgos"** y haz clic en **Confirmar**.

---

## 🧪 5. Prueba de Fuego: Comprobación en Vivo

Para validar que todo el circuito funciona de extremo a extremo:

1. Mantén la ventana de **Thunderbird** visible en tu pantalla.
2. En tu terminal conectada a CT 104, envía un correo simulando una notificación médica:
   ```bash
   cat <<EOF | /usr/sbin/sendmail -t
   To: paciente@grupo2.os
   From: citas@grupo2.os
   Subject: Notificacion: Su Cita Medica ha sido Asignada

   Estimado Paciente,
   Le confirmamos que su cita medica en clinica.grupo2.os quedo agendada para el lunes a las 10:00 AM.
   EOF
   ```
3. En menos de dos segundos verás entrar la notificación directamente en tu bandeja de entrada de Thunderbird en Windows. 📬

---

## ❓ 6. Solución de Problemas Frecuentes (*Troubleshooting*)

* **Thunderbird no logra conectar con el servidor (`192.168.56.104`):**
  * Si estás trabajando desde tu casa conectado a la red del equipo, verifica que tu cliente de **Tailscale** esté en estado **Connected**.
  * Haz una prueba rápida de conectividad abriendo otra ventana de PowerShell en Windows y escribiendo: `ping 192.168.56.104`.
* **Error: "Falló la autenticación con el servidor":**
  * Revisa que el nombre de usuario sea exactamente `paciente` y la contraseña sea `proxmox`.
  * Abre nuevamente `/etc/dovecot/conf.d/10-auth.conf` y asegúrate de que la línea `disable_plaintext_auth = no` no tenga un símbolo `#` al inicio.
* **¿Cómo crear buzones para otros usuarios o compañeros?:**
  * Cada vez que quieras dar de alta un usuario nuevo, ejecuta en CT 104:
    ```bash
    useradd -m -s /bin/bash nuevo_usuario
    echo "nuevo_usuario:proxmox" | chpasswd
    mkdir -p /home/nuevo_usuario/Maildir/{cur,new,tmp}
    chown -R nuevo_usuario:nuevo_usuario /home/nuevo_usuario/Maildir
    chmod -R 700 /home/nuevo_usuario/Maildir
    ```
    Y esa persona ya podrá configurar su cuenta `nuevo_usuario@grupo2.os` en su propio Thunderbird.
