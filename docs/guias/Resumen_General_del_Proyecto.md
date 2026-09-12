# 🏥 Sistema Clínico Grupo 2 — Resumen Ejecutivo y Estado General del Proyecto

> **Universidad Mariano Gálvez de Guatemala (UMG)**  
> **Facultad de Ingeniería en Sistemas de Información**  
> **Curso:** Sistemas Operativos I — 2do Semestre 2026  
> **Grupo Asignado:** **Grupo 2**  
> **Dominio Autoritativo:** **`grupo2.os`**  
> **Fecha Límite de Entrega:** Sábado 12 de septiembre de 2026 (23:59 hrs)  
> **Fecha de Última Actualización:** 10 de septiembre de 2026  

---

## 📌 1. Descripción del Proyecto y Alcance Clínico
El proyecto consiste en la implementación y despliegue sobre arquitectura de microservicios contenerizados de un **Sistema Integral de Gestión Clínica y Expedientes Médicos Electrónicos**.

### Módulos Principales del Negocio:
1. **Gestión de Pacientes:** Registro, búsqueda, historial clínico digital y asignación de citas.
2. **Consultas Médicas & Diagnósticos:** Registro de síntomas, diagnósticos CIE-10 y prescripción de recetas médicas.
3. **Constancias Médicas Certificadas:** Generación automática de constancias de reposo y diagnóstico médico en formato PDF.
4. **Notificaciones y Lectura de Correo:** Envío automático de confirmaciones de citas vía SMTP (`mail.grupo2.os:25`) y sincronización/lectura de buzones con IMAP (`mail.grupo2.os:143`).
5. **Almacenamiento Seguro (SFTP):** Descarga segura de constancias médicas y resultados de laboratorio en jaulas aisladas (`sftp.grupo2.os`).

---

## 🏗️ 2. Arquitectura de Infraestructura y Topología de Red para la Presentación

Para la entrega y evaluación presencial en el aula, el Grupo 2 desplegará su propia red física autónoma utilizando un **Mini-Switch Gigabit**, un **Access Point Ubiquiti UniFi nanoHD** y un **Firewall perimetral OPNsense**:

```mermaid
graph TD
    subgraph "Clientes en el Aula"
        Profesor["👨‍🏫 Laptop del Catedrático / Otros Grupos (.os)"]
    end

    subgraph "Infraestructura Física del Grupo 2 en el Aula"
        AP["📡 Ubiquiti UniFi nanoHD (Wi-Fi Grupo 2)"]
        PoE["⚡ Inyector PoE (LAN <-> PoE)"]
        Switch["🔌 Mini-Switch Gigabit (5 Puertos)"]
        
        AP --- PoE
        PoE ---|Cable 1| Switch
    end

    subgraph "Laptop del Compañero (Seguridad Perimetral)"
        OPN["🛡️ OPNsense (Router, Firewall, DHCP & Blacklist)<br/><b>IP LAN:</b> 192.168.56.1/24"]
        WAN["🌐 Uplink WAN (Wi-Fi Celular / Internet)"]
        OPN --- WAN
        OPN <-->|Cable 2: Bridged Ethernet| Switch
    end

    subgraph "Laptop de Marvin (Servidor Central de Microservicios)"
        PVE["🏢 Proxmox VE 8 (Hipervisor Debian 12)<br/><b>Bridged:</b> Realtek PCIe GbE Family Controller"]
        PVE <-->|Cable 3| Switch

        CT101["📦 CT 101: BIND9 DNS Autoritativo (:53)"]
        CT102["📦 CT 102: Backend Next.js + React (:3000)"]
        CT103["📦 CT 103: Nginx Reverse Proxy SSL (:443) & Redis (:6379)"]
        CT104["📦 CT 104: Postfix SMTP (:25), Dovecot IMAP (:143) & SFTP (:22)"]
        CT105["📦 CT 105: MariaDB SQL (:3306 Aislado)"]

        PVE --- CT101 & CT102 & CT103 & CT104 & CT105
    end

    Profesor -->|Wi-Fi: DHCP 192.168.56.200-250<br/>DNS: 192.168.56.101| AP
```

---

## 📋 3. Inventario de Servidores y Asignación de Roles

| ID Contenedor | Hostname / Rol | IP Estática | Dominio / Subdominio | Servicios Instalados / Configurados | Integrante Encargado |
| :---: | :--- | :---: | :--- | :--- | :---: |
| **PVE Host** | `pve` (Hipervisor) | `192.168.56.100`<br>`100.99.253.16` | `pve.local` | Proxmox VE 8, Vagrant, VirtualBox, Tailscale Gateway, `iptables`. | **Líder (Marvin)** |
| **CT 101** | `dns-dhcp` | `192.168.56.101` | `dhcp.grupo2.os`<br>`ns1.grupo2.os` | **BIND9 DNS Autoritativo** (`grupo2.os`), `isc-dhcp-server`. | **Integrante 1** |
| **CT 102** | `app-server` | `192.168.56.102` | `app.grupo2.os` | **Node.js 20 LTS**, PM2 Daemon, Prisma ORM, Aplicación Next.js (`:3000`). | **Integrante 3** |
| **CT 103** | `web-proxy` | `192.168.56.103` | `clinica.grupo2.os`<br>`portal.grupo2.os` | **Nginx HTTPS**, SSL, Reverse Proxy y **Redis 7 NoSQL** (:6379). | **Integrante 2 & 5** |
| **CT 104** | `mail-sftp` | `192.168.56.104` | `mail.grupo2.os`<br>`sftp.grupo2.os` | **Postfix SMTP** (:25) + **Dovecot IMAP** (:143), OpenSSH SFTP Chroot Jail. | **Integrante 4** |
| **CT 105** | `database-sql` | `192.168.56.105` | `db.grupo2.os` | **MariaDB/MySQL 10.11** (Datos clínicos). *(Redis reubicado en CT 103 por recursos)*. | **Integrante 5** |

---

## 🔑 4. Credenciales y Accesos Rápidos

> [!IMPORTANT]
> Todos los contenedores y el host Proxmox comparten las credenciales de administración para facilitar el trabajo grupal.

* **Panel Web de Proxmox:** `https://192.168.56.100:8006` *(o `https://100.99.253.16:8006` vía Tailscale)*
  * **Usuario:** `root` | **Contraseña:** `proxmox`
* **Acceso SSH a la Máquina Principal:**
  * `ssh root@192.168.56.100` *(Contraseña: `proxmox`)*
* **Acceso SSH a los Contenedores:**
  * CT 101 (DNS): `ssh root@192.168.56.101`
  * CT 102 (App): `ssh root@192.168.56.102`
  * CT 103 (Web Proxy): `ssh root@192.168.56.103`
  * CT 104 (Mail): `ssh root@192.168.56.104`
  * CT 105 (DB): `ssh root@192.168.56.105`
  * *(Contraseña unificada para todos los contenedores: `proxmox`)*
* **Servicio de Correo Electrónico (CT 104 - Dominio Oficial `@grupo2.os`):**
  * **Servidor SMTP (Envío / MTA):** `192.168.56.104` o `mail.grupo2.os` (Puerto `25`, sin autenticación requerida para subred interna `192.168.56.0/24`)
  * **Servidor IMAP (Lectura / MDA):** `192.168.56.104` o `mail.grupo2.os` (Puerto `143`, autenticación en texto plano permitida en LAN)
  * **Cuentas de Correo Creadas y Activas:**
    | Correo | Usuario Linux | Contraseña | Rol / Propósito | Buzón Físico |
    | :--- | :--- | :--- | :--- | :--- |
    | `paciente@grupo2.os` | `paciente` | `proxmox` | Paciente del sistema (recibe constancias, recetas y citas) | `/home/paciente/Maildir/` |
    | `medico@grupo2.os` | `medico` | `proxmox` | Médico tratante (recibe avisos y consultas clínicas) | `/home/medico/Maildir/` |
    | `notificaciones@grupo2.os` | *(Alias/Remitente)* | — | Remitente de envíos transaccionales desde el backend Next.js | N/A (Envío vía SMTP :25) |
  * **Descarte de Dominio Externo (`@grupoprecon.com`):**
    * Los correos con terminación `@grupoprecon.com` heredados del catálogo base quedan formalmente descartados y no se utilizarán en el entorno local.
    * Mapeo de reemplazo en la base de datos (`clinica.user` en CT 105):
      * `administrador_it@grupoprecon.com` $\rightarrow$ `admin@grupo2.os` (Rol: `ADMIN`)
      * `fernanda.navas@grupoprecon.com` $\rightarrow$ `medico@grupo2.os` (o `fernanda.navas@grupo2.os`) (Rol: `DOCTOR`)
      * `sandra.donis@grupoprecon.com` $\rightarrow$ `sandra.donis@grupo2.os` (Rol: `DOCTOR`)
      * `administrador_test@grupoprecon.com` $\rightarrow$ `test@grupo2.os` (Rol: `VIEWER`)
  * **Variables para Integración en Next.js (`/var/www/proyecto-grupo2/.env`):**
    ```env
    SMTP_HOST="192.168.56.104"
    SMTP_PORT=25
    SMTP_SECURE=false
    SMTP_FROM="notificaciones@grupo2.os"
    ```
* **Servicio de Almacenamiento Seguro SFTP (CT 104 — Puerto `22`):**
  * **FQDN:** `sftp.grupo2.os` | **IP:** `192.168.56.104`
  * **Modo de Seguridad:** Jaula aislada Chroot (`OpenSSH internal-sftp`)
  * **Cuentas de Acceso Configuradas:**
    | Usuario SFTP | Contraseña | Rol / Permisos | Directorio Chroot | Ruta Destino de Archivos |
    | :--- | :--- | :--- | :--- | :--- |
    | `paciente_sftp` | `proxmox` | **Solo Lectura (`-R`)** — Paciente | `/home/sftp/paciente_sftp` | `/constancias/` |
    | `backend_sftp` | `proxmox1` | **Lectura y Escritura** — Backend Next.js | `/home/sftp` | `/paciente_sftp/constancias/` |
  * **Variables para `.env` en Next.js (`CT 102`):**
    ```env
    SFTP_HOST="192.168.56.104"
    SFTP_PORT=22
    SFTP_USER="backend_sftp"
    SFTP_PASS="proxmox1"
    ```
* **Credenciales de Base de Datos y Caché (CT 105 & CT 103):**
  * **Base de Datos SQL (MariaDB en CT 105):** `clinica`
  * **Usuario SQL:** `admin` *(permisos habilitados para conexión remota `%`)*
  * **Contraseña SQL:** `1234` | **Puerto MySQL:** `3306`
  * **Caché NoSQL Redis (CT 103):** Puerto `6379` *(reubicado en CT 103 por optimización de recursos)*
  * **Cadenas de Conexión Prisma / Redis (`.env`):**
    ```env
    DATABASE_URL="mysql://admin:1234@192.168.56.105:3306/clinica"
    REDIS_URL="redis://192.168.56.103:6379"
    ```

---

## 🛠️ 5. Catálogo de Scripts y Documentos de Apoyo (`D:\Vagrant\proxmox\`)

Todos los scripts y guías están almacenados en el host (`D:\Vagrant\proxmox\`) y montados automáticamente dentro del servidor Proxmox en `/vagrant/`:

| Script / Documento | Propósito y Función | Dónde se ejecuta / Consulta |
| :--- | :--- | :---: |
| **`1_setup_network.sh`** | Configura el switch `vmbr0` y las reglas de NAT para dar internet a los contenedores. | Host Proxmox |
| **`2_download_template.sh`** | Descarga la plantilla oficial Debian 12 Bookworm para LXC en `/var/lib/vz/template/cache`. | Host Proxmox |
| **`3_create_containers.sh`** | Despliega los contenedores CT 101 al CT 104 con almacenamiento y redes asignadas. | Host Proxmox |
| **`4_setup_dns_bind9.sh`** | Instala y configura **BIND9 DNS** en CT 101 con la zona autoritativa `grupo2.os` y sus registros A/MX. | Host Proxmox |
| **`5_fix_pve_certs.sh`** | Regenera y soluciona certificados SSL para la consola web de Proxmox (`:8006`). | Host Proxmox |
| **`6_enable_ssh_passwords.sh`** | Habilita autenticación con contraseña `proxmox` en los contenedores para trabajo colaborativo. | Host Proxmox |
| **`7_create_ct105_database.sh`** | Crea el contenedor `CT 105` con 1.5 GB de RAM dedicado exclusivamente a Base de Datos. | Host Proxmox |
| **`8_setup_database_ct105.sh`** | Instala **MySQL (MariaDB)** y **Redis**, crea la BD `clinica_db` y habilita acceso a la red interna. | Host Proxmox |
| **`9_setup_nextjs_ct103.sh`** | Instala **Node.js 20 LTS**, npm, herramientas de compilación y **PM2** en el CT 103. | Host Proxmox |
| **`10_setup_nginx_ct103.sh`** | Configura **Nginx**, genera certificados SSL y establece el Reverse Proxy en CT 103 hacia Next.js (`192.168.56.102:3000`). | Host Proxmox |
| **`11_test_hello_world_ct102.sh`**| Despliega un servidor web de prueba ligero en Python puro con `systemd` para validar conectividad. | Host Proxmox |
| **`12_fix_host_only_bridge.sh`** | Une la tarjeta de red `eth1` (VirtualBox) al switch `vmbr0` para acceso directo desde Windows. | Host Proxmox |
| **`14_start_all_services.sh`** | Enciende todos los contenedores y reactiva DNS y Web tras reiniciar la computadora. | Host Proxmox |
| **`15_diagnose_and_fix_web.sh`** | Diagnostica y repara automáticamente enlaces de red, puertos y servicios web caídos. | Host Proxmox |
| **`16_setup_mail_ct104.sh`** | Instala y configura **Postfix SMTP**, buzones Maildir, cuentas de prueba y puerto 25 en CT 104. | Host Proxmox |
| **`17_apply_stability_and_keepalive.sh`** | Corrige colisión de IP `192.168.56.1`, asigna gateway `192.168.56.100` y activa KeepAlive SSH. | Host Proxmox |
| **`18_rollback_stability_and_keepalive.sh`** | Revierte la configuración de red y SSH al estado previo (para después de la entrega). | Host Proxmox |
| **`19_setup_dovecot_ct104.sh`** | Script complementario de instalación y verificación de Dovecot IMAP en CT 104. | Host Proxmox |
| **`20_purge_nginx_from_ct102.sh`** | Purga Nginx, elimina servicios web residuales y libera los puertos 80 y 443 en CT 102. | Host Proxmox |
| **`21_fix_better_auth_and_https_ct102.sh`** | Corrige `/etc/hosts`, optimiza middleware local, actualiza `.env` y recompila Next.js en CT 102. | Host Proxmox |
| **`Guia_Instalacion_IMAP_Dovecot_CT104.md`** | Guía paso a paso manual para aprendizaje y configuración de Dovecot IMAP. | CT 104 / Windows |
| **`Guia_Instalacion_SFTP_Chroot_CT104.md`** | Guía paso a paso manual para instalación inicial de SFTP Chroot Jail y pruebas generales. | CT 104 / Windows |
| **`Guia_Blindaje_SFTP_ReadOnly_y_Backend.md`** | Guía práctica enfocada exclusivamente en Read-Only (-R) para paciente y usuario Next.js. | CT 104 / Windows |

---

## 🚦 6. Estado Actual de los Hitos del Proyecto

```mermaid
gantt
    title Estado de Fases del Proyecto Clínico SO1
    dateFormat  YYYY-MM-DD
    section Fase 1: Infraestructura Base
    Hipervisor Proxmox VE 8 en Vagrant          :done, 2026-08-20, 2026-08-24
    Switch vmbr0 & NAT Internet                 :done, 2026-08-24, 2026-08-25
    5 Contenedores LXC Desplegados              :done, 2026-08-25, 2026-08-26
    VPN Tailscale & Acceso Grupal SSH           :done, 2026-08-25, 2026-08-26
    Servidor DNS BIND9 (grupo2.os)              :done, 2026-08-26, 2026-08-27
    Prueba de Conectividad Web HTTP             :done, 2026-08-26, 2026-08-27
    section Fase 2: Servicios & Datos
    Postfix SMTP en CT 104                      :done, 2026-09-03, 2026-09-04
    Dovecot IMAP en CT 104                      :done, 2026-09-05, 2026-09-06
    MariaDB SQL en CT 105                       :done, 2026-09-04, 1d
    Servidor SFTP Chroot Jail en CT 104         :done, 2026-09-06, 1d
    Blindaje SFTP (-R y backend_sftp)           :done, 2026-09-06, 1d
    Despliegue App Next.js en CT 102 (PM2)      :done, 2026-09-06, 1d
    Nginx Reverse Proxy & SSL en CT 103 (F3 P1) :done, 2026-09-06, 1d
    Ajuste Better Auth en CT 102 (F3 P2)        :done, 2026-09-06, 1d
    Redis NoSQL en CT 103 (Optimización recursos) :done, 2026-09-07, 1d
    Pruebas Mail Notificaciones & Descarga        :done, 2026-09-07, 1d
    section Fase 3: Seguridad & Entrega
    Firewall iptables, Aislamiento WAN & Blacklist :2026-09-08, 2d
    Servidor DHCP en CT 101                       :2026-09-09, 1d
    Monorepo Git Centralizado                     :2026-09-10, 1d
    Pruebas de Interoperabilidad (.os)            :2026-09-11, 1d
    ENTREGA Y PRESENTACIÓN FINAL                :milestone, 2026-09-12, 0d
```

### ✅ Hitos Completados (100% Operativos):
* Servidor Central Proxmox VE 8 funcionando en Windows con 8 GB de RAM asignados.
* Red privada interna `192.168.56.0/24` con salida a Internet y acceso bidireccional Windows $\leftrightarrow$ Contenedores.
* Los 5 contenedores LXC creados y configurados para encender solos (`onboot: 1`).
* Red Tailscale conectando a todo el equipo desde sus casas sin necesidad de abrir puertos en el router doméstico.
* Servidor DNS BIND9 (CT 101) respondiendo consultas para `clinica.grupo2.os`, `app.grupo2.os`, `db.grupo2.os`, `mail.grupo2.os` y `sftp.grupo2.os`.
* Servidor web de prueba validado con éxito desde el navegador de Windows en `http://clinica.grupo2.os`.
* **Servidor Postfix SMTP (CT 104) 100% Operativo:** Puerto `25` escuchando, buzones Maildir configurados, cuentas de prueba creadas (`paciente`, `medico`) y entrega local verificada exitosamente.
* **Pruebas de Notificaciones por Correo y Descarga de Archivos (✅ Completado):** Envío automático de notificaciones vía SMTP y flujo de descarga de archivos por correo electrónico verificados y funcionando de forma fluida.
* **Servidor Dovecot IMAP (CT 104) 100% Operativo:** Demonio `dovecot-imapd` instalado y configurado manualmente por el Integrante 4. Puerto `143` escuchando, `mail_location = maildir:~/Maildir`, autenticación local y sincronización gráfica verificada con Mozilla Thunderbird.
* **Base de Datos Relacional MariaDB (CT 105) 100% Operativa:** Servidor MariaDB 10.11 en ejecución, base de datos `clinica` creada, usuario `admin@%` con contraseña `1234` activo, `bind-address = 0.0.0.0` configurado para red interna, y puerto `3306` activo.
* **Capa NoSQL Redis en CT 103 (✅ Completado):** Servidor Redis 7 instalado y configurado en el contenedor CT 103 (`192.168.56.103:6379`) por optimización de recursos y balance de memoria respecto a CT 105. Operativo para sesiones y caché.
* **Servidor de Almacenamiento SFTP Enjaulado y Blindado (CT 104) 100% Operativo:**
  * OpenSSH Chroot Jail activo en `/home/sftp`.
  * **Cuenta de Paciente (`paciente_sftp`):** Bloqueada en Solo Lectura estricta con bandera **`-R`** (`ForceCommand internal-sftp -R`), impidiendo cualquier subida de archivos maliciosos.
  * **Cuenta de Servicio (`backend_sftp`):** Creada con permisos de escritura y contraseña `proxmox1` para depósito exclusivo de constancias y recetas desde Next.js.
  * Permisos grupales `775` en `/home/sftp/paciente_sftp/constancias`.
* **Servidor de Aplicación Next.js (CT 102) 100% Operativo:** Desplegado con Node.js 24 y gestionado bajo PM2 con el proceso `clinica` en puerto `3000` (`http://192.168.56.102:3000`), respondiendo `200 OK` ("PREMED | Gestión Clínica Médica") y conectado a MariaDB en CT 105.
* **Nginx Reverse Proxy & SSL en CT 103 (Fase 3 - Parte 1 Implementada):**
  * Nginx 1.22 instalado y en ejecución en CT 103 (`192.168.56.103`).
  * Certificados SSL TLS autofirmados generados en `/etc/nginx/ssl/clinica.grupo2.os.crt` y `.key`.
  * Virtual host activo redirigiendo puerto `80 -> 443` y enrutando `443` hacia `http://192.168.56.102:3000` con cabeceras `Host` y `X-Forwarded-Proto https`.
* **Better Auth & Acceso Web Seguro HTTPS 100% Operativo (Fase 3 - Parte 2):**
  * CT 102 purgado de servicios web conflictivos en puerto `80`.
  * `/etc/hosts` en CT 102 configurado apuntando `clinica.grupo2.os` a `192.168.56.103`.
  * Middleware `src/proxy.ts` optimizado con `baseURL: "http://127.0.0.1:3000"` para verificación local instantánea sin fallas SSL.
  * `.env` actualizado con `BETTER_AUTH_URL="https://clinica.grupo2.os"`, `BETTER_AUTH_TRUSTED_ORIGINS` y `NODE_TLS_REJECT_UNAUTHORIZED="0"`.
  * Proyecto compilado con `pnpm run build` y PM2 recargado con `--update-env`.
  * Navegación verificada en `https://clinica.grupo2.os/` redirigiendo fluidamente a `/sign-in` (HTTP 200 OK, formulario de acceso cargado).
  * Script de automatización: `21_fix_better_auth_and_https_ct102.sh`.

* **Aislamiento de Bases de Datos & Seeds Clínicos (✅ 100% Completado al 10 de Septiembre):**
  * Script automatizado: `22_setup_database_isolation.sh` y guía paso a paso `Guia_Aislamiento_de_Bases_de_Datos.md`.
  * MariaDB (CT 105 :3306) y Redis (CT 103 :6379) blindados con `iptables` con acceso exclusivo concedido a CT 102 (`192.168.56.102`). Tráfico externo rechazado con ICMP unreachable.
  * Cuentas y credenciales oficiales `@grupo2.os` aplicadas y verificadas en la base de datos `clinica`.
* **Restricción de Salida a Internet / Egress Filtering (✅ 100% Completado al 10 de Septiembre):**
  * Script automatizado: `23_setup_egress_wan_filtering.sh` y guía paso a paso `Guia_Restriccion_WAN_Egress_Filtering.md`.
  * Doble capa de blindaje aplicada en CT 105, CT 104 y CT 102 (a nivel de contenedor y en la cadena FORWARD del Host PVE).
  * Validado con éxito: `8.8.8.8` bloqueado con `Operation not permitted` (100% packet loss) y red local `192.168.56.102` con `0% packet loss` y latencia sub-milisegundo.
* **Topología Física de Red en el Aula (Plan A - Switch + nanoHD) (✅ 100% Verificado al 11 de Septiembre):**
  * Mini-Switch Gigabit de 5 puertos + Ubiquiti UniFi nanoHD con inyector PoE + OPNsense enlazados y validados con éxito.
  * Distribución de red local y emisión Wi-Fi para clientes lista para la presentación presencial.
* **Lista Negra (*Blacklist*) en Firewall (✅ 100% Completado al 11 de Septiembre):**
  * Configurada en OPNsense para bloqueo explícito de dominios/IPs externas no autorizadas (redes sociales / distracciones).
  * Panel de auditoría y registros de bloqueo listos para proyectar y demostrar al catedrático.

---

### ⏳ Lo que Hace Falta por Implementar:
1. **Monorepo Git Centralizado (Puntos Extra):** Unificar el repositorio con las carpetas `/infra`, `/database`, `/src`, `/docs`, `.gitignore` y `README.md`.
2. **Generación del Archivo `.ova` (Plan B de Respaldo):** Exportar `SO1-Proyecto1-Proxmox.ova` desde VirtualBox para tener una réplica lista en caso de contingencia.
3. **Pase a Adaptador Puente (Bridged) en VirtualBox (Día de Presentación):** Cambiar el Adaptador 2 de *Host-Only* a **Adaptador Puente (*Bridged*)** hacia `Realtek PCIe GbE Family Controller` (`--nicpromisc2 allow-all`) en cuanto se conecte el cable al Switch en el aula.

---

### 🚀 Protocolo de Despliegue Presencial en el Aula (Sábado en la Mañana):
1. **Paso 1 (Hardware):** Enchufar el Mini-Switch y el inyector PoE a la corriente.
2. **Paso 2 (Cableado):** Conectar Cable 1 (Laptop Compañero), Cable 2 (Tu puerto Realtek GbE) y Cable 3 (nanoHD PoE) a los puertos del Switch.
3. **Paso 3 (Puente en VirtualBox de Marvin):** Con la VM apagada, ejecutar en PowerShell:
   ```powershell
   & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm "SO1-Proyecto1-Proxmox" --nic2 bridged --bridgeadapter2 "Realtek PCIe GbE Family Controller" --nicpromisc2 allow-all
   ```
4. **Paso 4 (Encendido de Servidores):**
   ```powershell
   cd D:\Vagrant\proxmox
   vagrant up
   ```
5. **Paso 5 (Verificación de Conectividad):** Conectar un teléfono al Wi-Fi del nanoHD y abrir `https://clinica.grupo2.os`. Validar carga de página y login.

---

### 🧪 Lo que Tenemos que Probar (Ensayos de Mañana Viernes con Switch + nanoHD):

| # | Prueba a Ejecutar | Procedimiento | Resultado Esperado |
| :---: | :--- | :--- | :--- |
| **T1** | **Enlace Físico L2** | Conectar Laptop Compañero, Laptop Marvin (Realtek GbE) y PoE nanoHD a los puertos del Switch. | LEDs de enlace en verde fijo/parpadeante a 1 Gbps en los 3 puertos. |
| **T2** | **Arrendamiento DHCP & DNS** | Conectar un celular o laptop de prueba al Wi-Fi del nanoHD (`Grupo2_Clinica`). | El cliente recibe IP en el rango `192.168.56.200 - .250`, Gateway `192.168.56.1` y DNS `192.168.56.101`. |
| **T3** | **Resolución y Carga Web HTTPS** | Desde el cliente en la Wi-Fi, abrir en el navegador `https://clinica.grupo2.os`. | El DNS resuelve a `192.168.56.103` (Nginx), carga la página de inicio de sesión con SSL válido y Better Auth opera sin errores CORS. |
| **T4** | **Flujo Clínico E2E Completo** | Iniciar sesión como médico, registrar una consulta, generar constancia PDF y enviar receta. | • PDF depositado en `/home/sftp/paciente_sftp/constancias/` en CT 104.<br>• Notificación enviada vía SMTP (:25) y visible en Thunderbird (:143). |
| **T5** | **Validación de Aislamiento de BD** | Desde el cliente en la Wi-Fi, ejecutar `nc -zv 192.168.56.105 3306` y `nc -zv 192.168.56.103 6379`. | Conexión rechazada instantáneamente (`Connection refused`). Solo CT 102 tiene acceso a los datos. |

---

## 📧 7. Bitácora de Configuración del Servidor de Correo (Postfix SMTP & Dovecot IMAP — CT 104)

### 7.1. Servidor SMTP (Postfix — Envío y Transporte)
> **Fecha de Implementación & Verificación:** 3 - 4 de septiembre de 2026  
> **Responsable:** Especialista en Servicios (Integrante 4) / Apoyo Líder  
> **Script de Automatización:** [`16_setup_mail_ct104.sh`](file:///D:/Vagrant/proxmox/16_setup_mail_ct104.sh)

* **Contenedor Destino:** `CT 104` (`mail-sftp`) con IP estática `192.168.56.104`.
* **FQDN Autoritativo:** `mail.grupo2.os` (Dominio base: `grupo2.os`).
* **Protocolo y Puerto:** SMTP estándar en puerto `25` (ESMTP Postfix 3.7.x).
* **Registro DNS MX (CT 101):** Configurado previamente en BIND9 (`@ IN MX 10 mail.grupo2.os.`).
* **Parámetros Clave (`/etc/postfix/main.cf`):**
  * `mynetworks = 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128 192.168.56.0/24`: Envío directo desde CT 103 sin relay errors.
  * `home_mailbox = Maildir/`: Buzones individuales en `/home/<usuario>/Maildir/`.
  * `inet_interfaces = all` e `inet_protocols = ipv4`.

---

### 7.2. Servidor IMAP (Dovecot — Lectura y Sincronización en Escritorio)
> **Fecha de Implementación & Verificación:** 5 - 6 de septiembre de 2026  
> **Responsable:** Especialista en Servicios (Integrante 4) — *Configuración Manual Guiada*  
> **Guía Técnica de Referencia:** [`Guia_Instalacion_IMAP_Dovecot_CT104.md`](file:///C:/Users/marvi/Documents/Universidad/2026%20-%202do%20Semestre/Sistemas%20Operativos%20I/Proyecto_1/Guia_Instalacion_IMAP_Dovecot_CT104.md)

* **Contenedor:** `CT 104` (`mail-sftp`) — `192.168.56.104`.
* **Paquete Instalado:** `dovecot-imapd` (Debian 12 Bookworm).
* **Protocolo y Puerto:** IMAP en puerto `143` (TCP).
* **Parámetros Clave Aplicados:**
  1. `/etc/dovecot/conf.d/10-mail.conf`: `mail_location = maildir:~/Maildir` (permite reconocer la misma estructura que Postfix).
  2. `/etc/dovecot/conf.d/10-auth.conf`: `disable_plaintext_auth = no` (permite autenticación con contraseña `proxmox` en la LAN `192.168.56.0/24`).
* **Estado Operativo:** Servicio habilitado (`systemctl enable dovecot`) y validado con `ss -tulpn | grep 143`.
* **Integración Visual:** Conectado exitosamente con **Mozilla Thunderbird** en Windows, permitiendo ver y leer en tiempo real los correos recibidos para `paciente@grupo2.os` y `medico@grupo2.os`.

---

## 🔄 8. Guía de Operación Diaria (Cómo usar el entorno)

### ☀️ Al Encender la Computadora:
1. Abre **PowerShell** en Windows y navega a la carpeta de trabajo:
   ```powershell
   cd D:\Vagrant\proxmox
   vagrant up
   ```
2. Conéctate a la terminal del servidor central vía OpenSSH:
   ```powershell
   ssh root@192.168.56.100
   ```
   *(Contraseña: `proxmox`)*
3. Verifica que la aplicación de **Tailscale** en Windows esté en estado **Connected**.

### 🌙 Al Terminar de Trabajar (Apagado Seguro):
En tu terminal de PowerShell en Windows:
```powershell
cd D:\Vagrant\proxmox
vagrant halt
```
*(Todos los datos de la base de datos, configuraciones y contenedores quedan guardados intactos en el disco).*

### 🚨 En caso de que no cargue la web tras un reinicio:
Entra a la terminal del host (`ssh root@192.168.56.100`) y corre:
```bash
bash /vagrant/15_diagnose_and_fix_web.sh
```
*(Este comando revisa los enlaces de red, levanta los contenedores y reactiva los servicios automáticamente).*
