# 📋 Checklist Operativo Pre-Presentación — Proyecto 1: Ecosistema Clínico Seguro
> **Curso:** Sistemas Operativos I (Código: `22026-3190-029-B`)  
> **Grupo Asignado:** **Grupo 2** (`grupo2.os`)  
> **Fecha de Evaluación:** Sábado 12 de septiembre de 2026  
> **Tiempo Estimado de Ejecución:** 45 - 60 minutos antes de la presentación  
> **Entorno:** Proxmox VE 8 (5 Contenedores LXC) + OPNsense + Mini-Switch + Ubiquiti UniFi nanoHD  

---

## 🎯 Objetivo
Garantizar que la infraestructura de red física, el direccionamiento DHCP, la resolución DNS autoritativa `.os`, el proxy HTTPS con certificados SSL, el flujo de negocio clínico, el correo SMTP/IMAP, el almacenamiento seguro SFTP y las reglas de Firewall/Aislamiento funcionen al 100% de manera coordinada antes de la evaluación del catedrático.

---

## 🔌 FASE 1: Montaje Físico y Hardware (10 min)

- [ ] **1. Alimentación Eléctrica:**
  - [ ] Enchufar cargador de Laptop de Marvin.
  - [ ] Enchufar cargador de Laptop de OPNsense (Compañero).
  - [ ] Enchufar cargador de alimentación del Mini-Switch Gigabit.
  - [ ] Enchufar el inyector PoE Ubiquiti a la corriente.
- [ ] **2. Conexión del Inyector PoE $\leftrightarrow$ AP UniFi nanoHD:**
  - [ ] Conectar un cable de red desde el puerto **`PoE`** del inyector hasta el puerto RJ-45 del AP nanoHD.
  - [ ] *Verificación visual:* El anillo LED del nanoHD debe encender en luz fija (blanca o azul).
- [ ] **3. Cableado hacia el Mini-Switch Gigabit:**
  - [ ] **Cable 1:** Del puerto **`LAN`** del inyector PoE $\rightarrow$ Puerto 1 del Switch.
  - [ ] **Cable 2:** Del puerto Ethernet de la laptop de Marvin (`Realtek PCIe GbE`) $\rightarrow$ Puerto 2 del Switch.
  - [ ] **Cable 3:** Del puerto Ethernet de la laptop de OPNsense $\rightarrow$ Puerto 3 del Switch.
- [ ] **4. Validación de Enlace Físico (Capa 1/2):**
  - [ ] Verificar que los LEDs de los 3 puertos ocupados en el Mini-Switch estén en **verde fijo o parpadeante** (indicador de enlace Gigabit a 1 Gbps).

---

## ⚙️ FASE 2: Ajuste de Red en Laptops y VirtualBox (5 min)

### En la Laptop del Compañero (Router / Firewall OPNsense):
- [ ] **1. Adaptador 1 (WAN / Salida a Internet):**
  - [ ] Configurado en **Modo Puente** hacia su tarjeta **Wi-Fi** (conectada a los datos móviles de su celular para acceso WAN).
- [ ] **2. Adaptador 2 (LAN / Red Local Switch):**
  - [ ] Configurado en **Modo Puente (*Bridged Adapter*)** hacia la **tarjeta de red Ethernet física (RJ-45)** de su laptop.
  - [ ] Modo promiscuo: **Permitir todo (*Allow All*)**.
- [ ] **3. Verificación de IP de la interfaz LAN en OPNsense (`Interfaces -> LAN`):**
  - [ ] Dirección IPv4: **`192.168.56.1`**
  - [ ] Máscara de subred: **`/24`** (`255.255.255.0`)
- [ ] **4. Verificación del Servidor DHCP (`Services -> DHCPv4 -> LAN`):**
  - [ ] Rango dinámico (*Range*): **`192.168.56.200`** a **`192.168.56.250`**
  - [ ] Gateway: **`192.168.56.1`**
  - [ ] Servidor DNS 1 (*DNS Server*): **`192.168.56.101`** *(IP de tu CT 101 BIND9)*.
- [ ] **5. Nginx de Pruebas Apagado:**
  - [ ] Confirmar que el Nginx provisional que usó en su casa esté detenido para evitar colisión de puertos 80/443.

### En la Laptop de Marvin (Hipervisor Proxmox VE 8):
- [ ] **1. Pase a Modo Puente en VirtualBox:**
  - [ ] Con la máquina virtual `SO1-Proyecto1-Proxmox` **apagada**, abrir PowerShell en Windows y ejecutar:
    ```powershell
    & "C:\Program Files\Oracle\VirtualBox\VBoxManage.exe" modifyvm "SO1-Proyecto1-Proxmox" --nic2 bridged --bridgeadapter2 "Realtek PCIe GbE Family Controller" --nicpromisc2 allow-all
    ```

---

## 🚀 FASE 3: Secuencia de Encendido de Servidores (5 min)

- [ ] **1. Encender OPNsense Primero:**
  - [ ] Iniciar la VM de OPNsense en la laptop del compañero.
  - [ ] Esperar hasta que en la consola aparezca `LAN (em1) -> 192.168.56.1/24` y `WAN -> IP asignada por Wi-Fi`.
- [ ] **2. Encender Proxmox VE:**
  - [ ] En la laptop de Marvin, abrir PowerShell y ejecutar:
    ```powershell
    cd D:\Vagrant\proxmox
    vagrant up
    ```
- [ ] **3. Verificar Estado de los 5 Contenedores LXC:**
  - [ ] Conectarse por SSH a Proxmox:
    ```powershell
    ssh root@192.168.56.100
    ```
    *(Contraseña: `proxmox`)*
  - [ ] Ejecutar:
    ```bash
    pct list
    ```
  - [ ] Validar que los 5 contenedores figuren con estado **`running`**:
    * `CT 101` (dns-dhcp): `192.168.56.101`
    * `CT 102` (app-server Next.js): `192.168.56.102`
    * `CT 103` (web-proxy Nginx & Redis): `192.168.56.103`
    * `CT 104` (mail-sftp Postfix/Dovecot): `192.168.56.104`
    * `CT 105` (database-sql MariaDB): `192.168.56.105`
- [ ] *(En caso de que algún servicio o contenedor no levante)*: Ejecutar el script reparador en el Host Proxmox:
  ```bash
  bash /vagrant/15_diagnose_and_fix_web.sh
  ```

---

## 🧪 FASE 4: Batería de Ensayos Técnicos (T1 a T6) (15 min)

*(Conectar un teléfono celular o laptop de prueba a la red Wi-Fi emitida por el nanoHD: `Grupo2_Clinica`)*

### 📶 Prueba T1: Arrendamiento DHCP
- [ ] El dispositivo cliente se asocia exitosamente al SSID Wi-Fi.
- [ ] Inspeccionar los detalles de conexión en el cliente:
  * **IP recibida:** Debe estar entre `192.168.56.200` y `192.168.56.250`.
  * **Máscara:** `255.255.255.0` (`/24`).
  * **Puerta de enlace (Gateway):** `192.168.56.1`.
  * **Servidor DNS Primario:** `192.168.56.101`.
- [ ] *Demostración OPNsense:* En el panel de OPNsense (`Services -> DHCPv4 -> Leases`), verificar que aparece la MAC y la IP asignada al cliente.

### 🌐 Prueba T2: Resolución DNS Autoritativo (.os)
- [ ] Desde una terminal en el cliente (o laptop con PowerShell):
  ```bash
  nslookup clinica.grupo2.os 192.168.56.101
  nslookup mail.grupo2.os 192.168.56.101
  ```
  *(Debe resolver a `192.168.56.103` y `192.168.56.104` respectivamente, sin fallas).*

### 🔒 Prueba T3: Carga Web HTTPS y Certificados SSL
- [ ] Abrir el navegador en el cliente e ingresar a: `http://clinica.grupo2.os` (puerto 80).
- [ ] Verificar que Nginx fuerza la redirección inmediata a **`https://clinica.grupo2.os`** (puerto 443).
- [ ] Verificar que carga la vista de inicio de sesión (`/sign-in`) de PREMED Clínica con HTTP 200 OK.
- [ ] En terminal, comprobar el código HTTP 301 con:
  ```bash
  # En Linux / WSL:
  curl -I http://clinica.grupo2.os

  # En Windows PowerShell:
  curl.exe -I http://clinica.grupo2.os
  ```

### 🏥 Prueba T4: Flujo Clínico E2E Completo
- [ ] **1. Inicio de Sesión:** Entrar con la cuenta de médico:
  * **Usuario / Correo:** `medico@grupo2.os`
  * **Contraseña:** `12345678` (o clave definida en seed)
- [ ] **2. Consulta & Constancia:**
  * Seleccionar o crear un paciente de prueba.
  * Registrar diagnóstico médico y recetar medicamentos.
  * Hacer clic en **"Generar Constancia Médica y Notificar"**.
- [ ] **3. Validación de Correo (SMTP / IMAP):**
  * Abrir **Mozilla Thunderbird** en Windows (configurado con `paciente@grupo2.os` en `mail.grupo2.os:143`).
  * Validar la llegada inmediata del correo de confirmación enviado por Postfix.
- [ ] **4. Validación de Almacenamiento Seguro (SFTP Chroot Jail):**
  * Conectarse por SFTP a `sftp.grupo2.os` (puerto 22) con el usuario `paciente_sftp` (clave `proxmox`).
  * Entrar a `/constancias/` y descargar el PDF de la constancia generada.
  * **Prueba de Solo Lectura (-R):** Intentar subir cualquier archivo desde el cliente SFTP hacia la carpeta y verificar que el servidor lo rechaza con:
    ```text
    Upload failed / Permission denied
    ```

### 🛡️ Prueba T5: Blindaje de Seguridad & Aislamiento de BD (Rúbrica 30%)
- [ ] **1. Rechazo de Conexión Externa a BD:** Desde el cliente Wi-Fi, intentar conectarse directamente a MariaDB:
  ```bash
  # En Windows PowerShell:
  tnc 192.168.56.105 -p 3306

  # En Linux / WSL:
  nc -zv 192.168.56.105 3306
  ```
  *(Debe responder `TcpTestSucceeded : False` en Windows o `Connection refused` en Linux).*
- [ ] **2. Rechazo de Conexión Externa a Redis:**
  ```bash
  # En Windows PowerShell:
  tnc 192.168.56.103 -p 6379

  # En Linux / WSL:
  nc -zv 192.168.56.103 6379
  ```
  *(Debe responder rechazo instantáneo).*
- [ ] **3. Restricción WAN (Egress Filtering):** Desde la consola de CT 105 (Base de Datos):
  ```bash
  pct exec 105 -- ping -c 2 8.8.8.8
  ```
  *(Debe responder `Operation not permitted` / 100% packet loss).*

### 🚫 Prueba T6: Lista Negra (*Blacklist*) en OPNsense
- [ ] Intentar navegar desde el cliente Wi-Fi hacia un dominio de la lista negra (ej. `facebook.com` o el dominio bloqueado configurado).
- [ ] Validar que la petición es descartada o redirigida por el firewall perimetral.
- [ ] Mostrar en el panel de OPNsense el registro en vivo (*Live Log*) de paquetes bloqueados.

---

## 🖥️ FASE 5: Preparación de Pantallas para la Evaluación (5 min)

Dejar abiertas y organizadas las siguientes ventanas en la laptop de presentación antes de que el catedrático se acerque:

1. **Ventana 1 (Navegador):** `https://clinica.grupo2.os` maximizado, mostrando la interfaz web de la clínica.
2. **Ventana 2 (Consola Proxmox Web GUI):** `https://192.168.56.100:8006` mostrando el árbol con los 5 contenedores LXC en verde (`running`).
3. **Ventana 3 (Mozilla Thunderbird):** Bandeja de entrada de `paciente@grupo2.os` abierta y limpia.
4. **Ventana 4 (Terminal de Marvin / OpenSSH):** Terminal abierta y lista en `ssh root@192.168.56.100` para ejecutar las pruebas de `nc -zv` o `ping` cuando el profesor lo solicite.
5. **Ventana 5 (Laptop Compañero):** Panel de control de OPNsense en `Services -> DHCPv4 -> Leases` y `Firewall -> Log Files`.

---

## 👥 Resumen de Repartición de la Presentación (15 Minutos)

| Integrante | Rol | Tiempo | Qué Demuestra en Vivo |
| :--- | :--- | :---: | :--- |
| **Integrante 1** | *Red & DNS BIND9 (CT 101)* | 2.5 min | Conexión del cliente al Wi-Fi, resolución con `dig` de subdominios `clinica.grupo2.os` y registros MX. |
| **Integrante 2** | *Ingeniero Web & SSL (CT 103)* | 2.5 min | Redirección 80 $\rightarrow$ 443 en navegador, certificado TLS autofirmado con CA Local y Reverse Proxy Nginx. |
| **Integrante 3** | *Desarrollador Fullstack (CT 102)* | 2.5 min | Proceso `clinica` en PM2 (`pm2 status`), navegación por la app web, inicio de sesión y registro de consulta clínica. |
| **Integrante 4** | *Mail & SFTP Chroot (CT 104)* | 2.5 min | Recepción del correo en Thunderbird en tiempo real, descarga del PDF en SFTP y demostración de rechazo de subida (-R). |
| **Integrante 5 / Marvin** | *DevSecOps & Base de Datos (Host PVE / CT 105)* | 3 min | Contenedores en Proxmox, MariaDB SQL + Redis NoSQL, aislamiento de BD con `nc`, Egress WAN bloqueado y Monorepo Git. |

---

## 🚨 Guía de Contingencia Rápida (Solución de Problemas en Vivo)

| Problema / Fallo | Causa Raíz | Acción Correctiva Inmediata |
| :--- | :--- | :--- |
| **El cliente Wi-Fi no recibe dirección IP.** | El cable del inyector PoE está invertido. | Verificar que el cable que va hacia el Switch esté conectado en el puerto **`LAN`** del inyector, y el cable hacia el nanoHD en el puerto **`PoE`**. |
| **El cliente recibe IP en `10.0.0.x`.** | OPNsense no aplicó la subred `192.168.56.0/24`. | En OPNsense: ir a `Interfaces -> LAN`, cambiar IP a `192.168.56.1/24`, ir a `Services -> DHCPv4 -> LAN`, cambiar rango a `.200-.250`, guardar y dar **Apply Changes**. Luego reconectar Wi-Fi en el cliente. |
| **La página web no abre (`Connection refused`).** | Nginx o el proceso PM2 están detenidos tras el encendido. | En la terminal de Proxmox ejecutar: `bash /vagrant/15_diagnose_and_fix_web.sh`. Esto levanta contenedores, regenera interfaces y reinicia PM2 y Nginx en 15 segundos. |
| **No resuelve los dominios `.os` en el navegador.** | El DHCP de OPNsense no entregó el DNS local. | En OPNsense verificar que en `Services -> DHCPv4 -> LAN -> DNS 1` esté escrito exactamente: **`192.168.56.101`**. |
| **Error de autenticación Better Auth.** | La hora del sistema en el host o contenedor está desfasada. | En CT 102 ejecutar: `pct exec 102 -- date` y si está desfasada correr `pct exec 102 -- chronyd -q 'server pool.ntp.org iburst'` o sincronizar hora del sistema. |
