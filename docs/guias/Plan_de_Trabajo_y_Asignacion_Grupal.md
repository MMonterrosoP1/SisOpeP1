# 📋 Plan Integral de Trabajo y Asignación Grupal: Proyecto 1 SO1
> **Curso:** Sistemas Operativos I (Código: `22026-3190-029-B`)  
> **Catedrático:** Universidad Mariano Gálvez de Guatemala  
> **Proyecto:** Sistema Integral de Gestión Clínica y Expedientes Médicos Electrónicos  
> **Modalidad:** Grupal (5 Integrantes)  
> **Fecha Límite de Entrega:** 12 - 13 de septiembre de 2026 — 23:59 hrs (GMT-6)  
> **Entorno de Trabajo:** Proxmox VE 8 (5 Contenedores LXC aislados + Tailscale VPN)

---

## 🚦 Estado Actual del Proyecto (Hitos al 7 de Septiembre de 2026)

- [x] **Infraestructura Base:** Servidor Proxmox VE 8 desplegado con Vagrant (Debian 12, 6 GB RAM).
- [x] **Conmutador de Red:** Switch virtual `vmbr0` puenteado con `eth1` (VirtualBox Host-Only) y NAT a Internet (`eth0`).
- [x] **5 Contenedores LXC Creados y Activos:**
  - `CT 101` (`192.168.56.101`): DNS & DHCP (onboot: 1)
  - `CT 102` (`192.168.56.102`): App REST Next.js & Frontend (/var/www/proyecto-grupo2) (onboot: 1)
  - `CT 103` (`192.168.56.103`): Web Nginx, Proxy SSL & Redis NoSQL (onboot: 1)
  - `CT 104` (`192.168.56.104`): Mail (SMTP/IMAP) & SFTP (onboot: 1)
  - `CT 105` (`192.168.56.105`): Base de Datos MariaDB SQL (onboot: 1)
- [x] **Acceso Remoto Colaborativo:** Red privada **Tailscale VPN** enlazada con los integrantes y subred `192.168.56.0/24` enrutada.
- [x] **Acceso SSH Habilitado:** Login remoto con contraseña `proxmox` activo en los 5 contenedores.
- [x] **DNS BIND9 Operativo (P0):** Zona autoritativa **`grupo2.os`** activa (`clinica.grupo2.os` $\rightarrow$ `192.168.56.103`).
- [x] **Prueba de Servidor Web:** Verificada exitosamente desde el navegador en `http://clinica.grupo2.os`.
- [x] **Base de Datos MariaDB en CT 105:** Servidor SQL activo en puerto `3306`, BD `clinica` creada, usuario `admin@%` con acceso remoto probado.
- [x] **Servidor de Correo Completo en CT 104 (SMTP + IMAP):** Postfix (puerto `25`, buzones Maildir) + Dovecot IMAP (puerto `143`, lectura sincronizada en Thunderbird).
- [x] **Pruebas de Notificaciones por Correo & Descarga de Archivos:** Flujo automático de correo SMTP y descarga validado exitosamente.
- [x] **Capa NoSQL Redis en CT 103 (Fase 2):** Servidor Redis 7 instalado y configurado en CT 103 (`192.168.56.103:6379`) para optimización de recursos y memoria en CT 105.
- [x] **Servidor de Aplicación Next.js en CT 102:** Proceso PM2 `clinica` en ejecución *online* en puerto `3000` con Node.js 24 y conectado a MariaDB y Redis.
- [x] **Nginx Reverse Proxy & SSL en CT 103 (Fase 3 - Parte 1):** Certificados SSL TLS generados en `/etc/nginx/ssl/`, Nginx configurado con redirección obligatoria `80 -> 443` y proxy inverso activo hacia `http://192.168.56.102:3000`.
- [x] **Better Auth & HTTPS Operativo en CT 102 (Fase 3 - Parte 2):** `BETTER_AUTH_URL="https://clinica.grupo2.os"` configurado, Trusted Origins actualizados, middleware optimizado para verificación local y Next.js recompilado en producción con éxito.
- [ ] **Próximo Hito (Fase 3):** Firewall Central iptables (Aislamiento WAN/BD & Blacklist), Servidor DHCP en CT 101 y Monorepo Git.

---

## 🏥 1. Descripción del Sistema y Alcance Clínico
El proyecto implementa una plataforma web de **Gestión Clínica y Expedientes Médicos Electrónicos** diseñada para:
1. **Administración de Pacientes:** Registro, búsqueda, asignación de médico y gestión de expedientes.
2. **Consultas Médicas & Historial Clínico:** Registro de signos vitales, diagnósticos CIE-10, evolución del paciente y recetas.
3. **Emisión de Constancias Médicas Certificadas:** Generación automática de constancias en PDF/TXT, almacenamiento seguro en servidor SFTP y notificación inmediata por correo electrónico al paciente.
4. **Interoperabilidad Inter-grupal (.os):** Capacidad de consultar pacientes, verificar certificados médicos e intercambiar correos entre dominios clínicos de otros grupos del aula.

---

## 🏗️ 2. Arquitectura de Microservicios en 5 Contenedores LXC

Cada integrante del equipo dispone de un **Contenedor Linux (Debian 12)** dedicado e independiente conectado al switch virtual `vmbr0` (`192.168.56.0/24`), permitiendo el desarrollo remoto concurrente mediante **Tailscale VPN**:

```mermaid
graph TD
    User["👨‍⚕️ Médico / Paciente"] -->|https://clinica.grupo2.os (Port 443)|    CT103["🔒 CT 103: Nginx Proxy & Redis NoSQL<br/><b>IP:</b> 192.168.56.103<br/>👤 <i>Integrante 2 & 5</i>"]
    
    CT103 -->|proxy_pass http://192.168.56.102:3000| CT102["⚙️ CT 102: Next.js + React Fullstack<br/><b>IP:</b> 192.168.56.102<br/>👤 <i>Integrante 3</i>"]
    
    CT105_SQL[("🗄️ CT 105: MySQL (MariaDB)<br/>Prisma ORM | Port 3306")]

    CT102 -->|Prisma: DATABASE_URL| CT105_SQL
    CT102 -->|ioredis: REDIS_URL| CT103
    
    CT102 -->|Nodemailer SMTP (Port 25)| CT104_Mail["📧 Postfix SMTP<br/><b>IP:</b> 192.168.56.104"]
    CT102 -->|Sube Constancias PDF (Port 22)| CT104_SFTP["📁 SFTP Chroot Jail<br/><b>IP:</b> 192.168.56.104"]

    CT101["🌐 CT 101: BIND9 DNS & DHCP<br/><b>IP:</b> 192.168.56.101<br/>👤 <i>Integrante 1</i>"] -.->|Resuelve clinica, mail, sftp, db| CT102 & CT103 & CT104_Mail & CT105_SQL
    
    Host_FW["🛡️ Host Proxmox: Firewall iptables, Egress & Blacklist<br/><b>IP:</b> 192.168.56.1<br/>👤 <i>Integrante 5 / DevSecOps</i>"] --- CT102 & CT103 & CT104_Mail & CT105_SQL
```

---

### 📊 Matriz de Asignación de Contenedores y Roles

| Contenedor | IP Estática | Rol Asignado | Responsable | Módulos y Tecnologías |
| :---: | :---: | :--- | :--- | :--- |
| **CT 101** | `192.168.56.101` | 🌐 **Líder de Red, DNS & DHCP** | **Integrante 1** | • BIND9 (`clinica.grupo2.os`, `mail`, `sftp`, `db`, `dhcp`).<br>• ISC-DHCP-Server (Puntos Extra). |
| **CT 102** | `192.168.56.102` | ⚙️ **Desarrollador Fullstack Next.js** | **Integrante 3** | • Next.js (React + API en `/var/www/proyecto-grupo2`).<br>• Conexión Prisma ORM a MySQL y Redis.<br>• Integración con Mailer y subida SFTP. |
| **CT 103** | `192.168.56.103` | 🔒 **Ingeniero Web, Proxy & SSL** | **Integrante 2 & 5** | • Nginx Reverse Proxy (Redirección 80 $\rightarrow$ 443 hacia 192.168.56.102:3000).<br>• Generación de CA Local y Certificados SSL TLS.<br>• **Redis 7 NoSQL** (:6379) para sesiones y caché. |
| **CT 104** | `192.168.56.104` | 📧 **Especialista en Mail & SFTP** | **Integrante 4** | • Servidor SMTP Postfix (`mail.grupo2.os:25`).<br>• Servidor IMAP Dovecot (`mail.grupo2.os:143`).<br>• Servidor SFTP con Chroot Jail (`sftp.grupo2.os`). |
| **CT 105** | `192.168.56.105` | 🗄️ **Administrador de Base de Datos SQL** | **Integrante 5** | • **MySQL (MariaDB):** Tablas de pacientes, consultas, recetas y constancias.<br>*(Redis reubicado en CT 103 por optimización de recursos)*. |
| **Host Proxmox** | `192.168.56.1` | 🛡️ **DevSecOps, Firewall & Git Master** | **Líder / DevSecOps** | • Aislamiento estricto de BD (3306/6379).<br>• Firewall iptables (Blacklist & Egress).<br>• Monorepo Git y Tailscale VPN. |

---

## 👥 3. Desglose de Tareas Detalladas por Integrante

### 👤 Integrante 1: Líder de Red, DNS BIND9 & Servidor DHCP
* **Objetivos:**
  1. Configurar **BIND9** con la zona autoritativa `grupo2.os`.
  2. Crear registros tipo `A`, `CNAME` y `MX`:
     * `clinica.grupo2.os` $\rightarrow$ `192.168.56.103` (Proxy Web Nginx)
     * `portal.grupo2.os` $\rightarrow$ `clinica.grupo2.os` (CNAME)
     * `app.grupo2.os` $\rightarrow$ `192.168.56.102` (Servidor de Aplicación Next.js)
     * `mail.grupo2.os` $\rightarrow$ `192.168.56.104` (Registro MX prioridad 10)
     * `sftp.grupo2.os` $\rightarrow$ `192.168.56.104`
     * `db.grupo2.os` $\rightarrow$ `192.168.56.105`
     * `dhcp.grupo2.os` $\rightarrow$ `192.168.56.101`
  3. Configurar **Forwarders** hacia `8.8.8.8` y reenvío condicional para resolver dominios de los otros grupos en la LAN.
  4. Configurar **ISC-DHCP-Server** (Puntos Extra) con rango dinámico de IPs para clientes en el aula.
* **Entregables en Git:** `/infra/dns/` (`named.conf.local`, `db.grupo2.os`) y `/infra/dhcp/` (`dhcpd.conf`).
* **Script de referencia:** `4_setup_dns_bind9.sh`

---

### 👤 Integrante 2: Ingeniero Web, Nginx Proxy & Certificados SSL/TLS (CT 103)
* **Objetivos:**
  1. [x] **Crear la Autoridad Certificadora Local (CA) / Certificados Autofirmados (✅ Completado):** Llave privada y certificado SSL TLS generados con OpenSSL para `clinica.grupo2.os` en `/etc/nginx/ssl/`.
  2. [x] **Configurar Nginx en CT 103 como Reverse Proxy (✅ Completado):**
     * Redirección forzada `HTTP (80)` $\rightarrow$ `HTTPS (443)`.
     * Terminación SSL y enrutamiento interno hacia Next.js en CT 102 (`proxy_pass http://192.168.56.102:3000;`).
     * Configuración de cabeceras seguras (`X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto https`, `X-Forwarded-Host`).
* **Entregables en Git:** `/infra/ssl/` (certificados y scripts) y `/infra/nginx/` (`clinica.grupo2.os.conf`).

---

### 👤 Integrante 3: Desarrollador Fullstack (Next.js + React + Prisma en CT 102)
* **Objetivos:**
  1. [x] **Gestionar el código de la aplicación (✅ Completado):** Ubicado en `/var/www/proyecto-grupo2/` en CT 102.
  2. [x] **Desplegar Next.js en producción usando PM2 (✅ Completado):** Proceso `clinica` activo en puerto `3000` con Node.js 24.
  3. [x] **Actualizar Better Auth y variables de entorno (✅ Completado):** Configurado `BETTER_AUTH_URL="https://clinica.grupo2.os"`, orígenes confiables y reiniciado PM2 con `--update-env`.
  4. [x] **Configurar la conexión a Redis (✅ Completado):** Variable `REDIS_URL="redis://192.168.56.103:6379"` configurada hacia CT 103 por optimización de recursos.
  5. [x] **Validar el flujo de notificaciones y correo (✅ Completado):** Envío automático de notificaciones vía SMTP y descarga de archivos verificado exitosamente.
  6. [ ] **Verificación final de constancias en SFTP:** Confirmar depósito en `/paciente_sftp/constancias/` con usuario `backend_sftp`.
* **Entregables en Git:** `/src/`, `/prisma/`, `package.json`, `ecosystem.config.js`.

---

### 👤 Integrante 4: Especialista en Correo (Postfix SMTP & Dovecot IMAP) & Servidor SFTP
* **Objetivos:**
  1. [x] **Configurar servidor Postfix SMTP (✅ Completado):**
     * Puerto estándar `25` activo para `mail.grupo2.os`.
     * Recepción y entrega local inmediata en buzones `/home/<usuario>/Maildir/`.
     * Cuentas de correo activas bajo dominio oficial `@grupo2.os`: `paciente@grupo2.os`, `medico@grupo2.os` (remitente: `notificaciones@grupo2.os`).
     * **Regla de Proyecto:** Descarte total del dominio externo `@grupoprecon.com` del seed original, reemplazándolo por `@grupo2.os` en base de datos y backend.
  2. [x] **Configurar servidor Dovecot IMAP (✅ Completado por Integrante 4):**
     * Instalación y configuración manual de `dovecot-imapd` en CT 104.
     * Enlace a buzones de usuarios: `mail_location = maildir:~/Maildir` en `/etc/dovecot/conf.d/10-mail.conf`.
     * Autenticación local habilitada: `disable_plaintext_auth = no` en `/etc/dovecot/conf.d/10-auth.conf`.
     * Servicio activo y habilitado en arranque (`systemctl enable dovecot`).
     * Validación y sincronización de bandeja de entrada verificada en **Mozilla Thunderbird** en Windows (Puerto `143`).
  3. [x] **Configurar servidor SFTP con OpenSSH, Chroot Jail y Blindaje (✅ Completado por Integrante 4):**
      * [x] Guías paso a paso elaboradas: `Guia_Instalacion_SFTP_Chroot_CT104.md` y `Guia_Blindaje_SFTP_ReadOnly_y_Backend.md`.
      * [x] Creación de grupo `sftp_users`, usuario `paciente_sftp` y jaula Chroot (`/home/sftp/paciente_sftp/constancias`) con permisos `root:root 755`.
      * [x] **Blindaje Read-Only Activo:** Bandera **`-R`** (`ForceCommand internal-sftp -R`) configurada en `/etc/ssh/sshd_config.d/sftp.conf`, bloqueando subidas al paciente.
      * [x] **Usuario de Backend Configurado:** Usuario `backend_sftp` (contraseña `proxmox1`) creado con home `/home/sftp`, reglas de escritura y permisos grupales `775` en `constancias/`.
      * [x] Servicio `ssh` validado y activo en CT 104.
* **Entregables en Git:** `/infra/mail/` (`main.cf`, `master.cf`, dovecot configs) y `/infra/sftp/` (`sftp.conf`, `Guia_Instalacion_SFTP_Chroot_CT104.md`, `Guia_Blindaje_SFTP_ReadOnly_y_Backend.md`).

---

### 👤 Integrante 5: Administrador de Base de Datos Híbrida (SQL + NoSQL)
* **Objetivos:**
  1. [x] **Instalar y configurar MariaDB / MySQL en CT 105 (✅ Completado):**
     * Habilitar `bind-address = 0.0.0.0` para permitir consultas desde la red interna (`192.168.56.0/24`).
     * Base de datos `clinica` creada con usuario `admin@%` y contraseña `1234`.
     * Override de compatibilidad systemd aplicado en LXC (`/etc/systemd/system/mariadb.service.d/override.conf`).
     * Conectividad TCP remota (puerto `3306`) validada con éxito desde CT 103 (API).
  2. [x] **Instalar y configurar Redis Server (Capa NoSQL - Puntos Extra ✅ Completado):**
     * Instalado en **CT 103** (`192.168.56.103:6379`) por optimización de recursos y memoria RAM en CT 105.
     * Habilitado para red interna y enlazado con la aplicación Next.js.
  3. [x] **Ejecutar scripts de inicialización y datos de prueba (*seeds* de pacientes y médicos):**
     * Esquema sincronizado, datos cargados y depuración completa de correos `@grupoprecon.com` hacia `@grupo2.os`.
* **Entregables en Git:** `/database/sql/` (`schema.sql`, `seeds.sql`) y `/database/nosql/` (`redis.conf`).
* **Cadena de Conexión Activa:** `DATABASE_URL="mysql://admin:1234@192.168.56.105:3306/clinica"`

---

### 👤 Líder / DevSecOps: Firewall Central, Monorepo Git & Red
* **Objetivos:**
  1. **Monorepo Git:** Mantener la estructura del repositorio, revisar Pull Requests y resolver conflictos de ramas.
  2. **Firewall Central (Host Proxmox `192.168.56.1` / `iptables`):**
     * [x] **Aislamiento de BD:** Bloqueo estricto de puertos `3306` y `6379` para cualquier tráfico externo que no provenga del servidor de aplicación CT 102 (`192.168.56.102`).
     * [x] **Restricción de Internet (Egress Filtering / Aislamiento WAN ✅ Completado):**
       * Salida a Internet bloqueada en CT 105 (BD), CT 104 (Mail/SFTP) y CT 102 (App Server) mediante doble capa de iptables (Host PVE + Contenedor).
       * Comunicación interna `192.168.56.0/24` 100% operativa (0% packet loss verificado).
       * [x] **Lista Negra (*Blacklist* - Puntos Extra ✅ Completado):** Reglas de bloqueo explícito para dominios e IPs externas no autorizadas implementadas y activas en OPNsense.
  3. **Tailscale VPN & LAN:** Gestionar los accesos de los compañeros y coordinar el despliegue presencial.
  4. **[ ] Despliegue Presencial en el Aula (Sábado):** Conectar cable al puerto Realtek GbE hacia el Switch físico y pasar Adaptador 2 a Modo Puente (*Bridged*) con `--nicpromisc2 allow-all`.
* **Entregables en Git:** `/infra/firewall/` (`firewall-rules.sh`), `.gitignore`, `README.md`.

---

## 🚫 4. Mapa de Dependencias y Bloqueos

```mermaid
graph TD
    classDef block fill:#ff4d4d,stroke:#990000,color:white;
    classDef dev fill:#2d7dd2,stroke:#1a4c80,color:white;
    classDef ready fill:#2bb673,stroke:#1b7046,color:white;

    I_Infra["✅ Infra Proxmox & Tailscale OK<br/>(Completado)"]:::ready --> I1_DNS["🌐 BIND9 DNS (.os)<br/>(Integrante 1)"]:::dev
    I_Infra --> I5_DB["🗄️ MySQL MariaDB (CT 105)<br/>(✅ Listo - Redis Pendiente)"]:::ready
    
    I5_DB -->|Prisma requiere MySQL activo| I3_Next["⚙️ Backend Next.js (CT 102)<br/>(Integrante 3)"]:::dev
    I1_DNS -->|Requiere clinica.grupo2.os| I2_SSL["🔒 Nginx HTTPS & SSL (CT 103)<br/>(Integrante 2)"]:::dev
    I1_DNS -->|Requiere mail.grupo2.os| I4_Mail["📧 Postfix & SFTP (CT 104)<br/>(Integrante 4)"]:::dev
    
    I3_Next -->|Requiere Next.js en :3000| I2_SSL
    I3_Next -->|Dispara constancias y correos| I4_Mail

    I2_SSL & I4_Mail --> I_Sec["🛡️ Firewall Blacklist & Egress<br/>(DevSecOps)"]:::block
    I_Sec --> I_Eval["🎓 Pruebas Finales Inter-grupales (.os)"]:::ready
```

---

## ⭐ 5. Matriz de Puntos Extra e Innovaciones Requeridas

| Requerimiento de Puntos Extra | Integrante Responsable | Implementación en el Sistema Clínico |
| :--- | :---: | :--- |
| **1. Subdominios por Protocolo en `.os`** | **Integrante 1 & 2** | `clinica` (Web), `mail` (SMTP), `sftp` (Constancias), `db` (Base de datos). |
| **2. Base de Datos Híbrida (SQL + NoSQL)** | **Integrante 5 & 3** | Transacciones en MySQL (Prisma) + Caché de sesiones y citas en Redis. |
| **3. Lista Negra (*Blacklist*) en Firewall** | **Líder / DevSecOps** | Cadena `BLACKLIST` en `iptables` demostrando bloqueo de IPs/dominios externos. |
| **4. Servidor DHCP Local** | **Integrante 1** | Asignación automática de IP y DNS a clientes conectados en el aula. |
| **5. Monorepo Git Centralizado** | **Todos** | Repositorio unificado con carpetas `/prisma`, `/src`, `/infra`, `/database`. |

---

## 📂 6. Estructura del Monorepo Git

```text
proyecto1-so1-monorepo/
├── .gitignore
├── README.md
├── package.json                    # Dependencias Next.js, Prisma, Tailwind, etc.
├── prisma/                         # Base de Datos & ORM (Integrante 5 & 3)
│   ├── schema.prisma               # Modelos de Pacientes, Médicos, Consultas y Constancias
│   └── migrations/                 # Historial de migraciones SQL
├── src/                            # Aplicación Next.js (Integrante 3 & 2)
│   ├── app/                        # Rutas de frontend y API Endpoints
│   │   ├── api/                    # /api/pacientes, /api/consultas, /api/constancias
│   │   ├── pacientes/              # Vistas de gestión de pacientes
│   │   └── consultas/              # Vistas de historial y consulta médica
│   ├── components/                 # Componentes de interfaz React
│   └── lib/                        # Clientes de Prisma, Redis y Nodemailer
├── infra/                          # Infraestructura como Código (IaC)
│   ├── dns/                        # BIND9: named.conf.local, db.grupo2.os
│   ├── dhcp/                       # ISC-DHCP: dhcpd.conf
│   ├── ssl/                        # Scripts OpenSSL para CA y certificados
│   ├── nginx/                      # Nginx: clinica.grupo1.os.conf
│   ├── mail/                       # Postfix: main.cf, master.cf
│   ├── sftp/                       # OpenSSH: sshd_config (chroot)
│   └── firewall/                   # Scripts iptables: firewall-rules.sh
└── docs/                           # Documentación técnica, manuales y bitácora
```

---

## 📅 7. Cronograma de Fases (Ruta Crítica)

```mermaid
gantt
    title Cronograma de Ejecución - Sistema Clínico SO1
    dateFormat  YYYY-MM-DD
    section Fase 1: Base OK
    Proxmox VE 8, 5 CTs & Tailscale VPN   :done, 2026-08-20, 5d
    section Fase 2: Red & Datos
    DNS BIND9 (.os) & DHCP (CT 101)       :2026-08-25, 4d
    MySQL + Redis NoSQL (CT 105)          :2026-08-25, 4d
    section Fase 3: App & Web
    Prisma Migrations & Next.js (CT 102)  :2026-08-29, 6d
    Nginx Reverse Proxy & SSL (CT 103)    :2026-08-29, 6d
    section Fase 4: Comunicaciones
    Postfix SMTP & SFTP Chroot (CT 104)   :2026-09-03, 5d
    section Fase 5: Cierre & Evaluación
    Firewall Blacklist, Egress & LAN Test :2026-09-08, 4d
    Presentación y Evaluación Final       :2026-09-12, 2d
```
