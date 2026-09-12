# 🛡️ Guía Práctica: Aislamiento de Bases de Datos (Firewall iptables)
> **Curso:** Sistemas Operativos I — UMG  
> **Proyecto:** Sistema Integral de Gestión Clínica (Grupo 2)  
> **Nivel:** Principiante / Paso a Paso  
> **Objetivo:** Blindar las bases de datos para que **solo** el servidor de la aplicación (CT 102) pueda comunicarse con ellas, bloqueando a cualquier intruso o máquina no autorizada.

---

## 💡 1. ¿Qué es el "Aislamiento de Base de Datos" y por qué lo pide el catedrático?

### La Analogía de la Bóveda del Banco:
Imagina un banco:
* **El Cliente:** Es el usuario común que visita la página web en su navegador.
* **El Cajero (CT 102 - Servidor de Aplicación Next.js):** Es el único empleado autorizado que tiene la llave y el permiso para entrar a la bóveda.
* **La Bóveda (CT 105 - MariaDB y CT 103 - Redis):** Es donde está guardado el dinero y los expedientes clínicos confidenciales de los pacientes.

> [!CAUTION]
> **El Gran Peligro:** Si la bóveda estuviera en medio del pasillo con la puerta abierta, cualquier persona en la calle (un hacker, un alumno de otro grupo, o un escáner de puertos) podría conectarse directamente a la base de datos y robar o borrar toda la información clínica.

### El Objetivo Técnico:
El **Aislamiento de Base de Datos** consiste en colocar un "guardia de seguridad" (**Firewall / iptables**) en la puerta de la base de datos con una orden estricta:
1. Si quien toca la puerta es el **Cajero (CT 102 — IP `192.168.56.102`)**, déjalo pasar (`ACCEPT`).
2. Si quien toca la puerta es **cualquier otra IP** (la máquina del profesor, tu Windows, otro grupo o un contenedor no autorizado como CT 104), **ciérrale la puerta en la cara inmediatamente (`REJECT` o `DROP`)**.

---

## 🗺️ 2. Mapa de Quién Entra y Quién NO Entra

```mermaid
graph TD
    subgraph "Permitidos (Tienen Llave)"
        CT102["⚙️ CT 102 (192.168.56.102)<br/>Backend Next.js / Prisma"]
    end

    subgraph "Bloqueados (Acceso Denegado)"
        Windows["💻 Host Windows (192.168.56.1)"]
        CT101["🌐 CT 101 DNS/DHCP (192.168.56.101)"]
        CT104["📧 CT 104 Mail/SFTP (192.168.56.104)"]
        Aula["👥 Laptops de Otros Grupos (.os)"]
    end

    subgraph "Bases de Datos Protegidas"
        CT105[("🗄️ CT 105 MariaDB SQL<br/>Puerto: 3306")]
        CT103[("⚡ CT 103 Redis NoSQL<br/>Puerto: 6379")]
    end

    CT102 -->|✅ PERMITIDO (Puerto 3306)| CT105
    CT102 -->|✅ PERMITIDO (Puerto 6379)| CT103

    Windows -.->|❌ BLOQUEADO| CT105
    Windows -.->|❌ BLOQUEADO| CT103
    CT101 -.->|❌ BLOQUEADO| CT105
    CT104 -.->|❌ BLOQUEADO| CT105
    Aula -.->|❌ BLOQUEADO| CT105
```

---

## 🛠️ 3. Paso a Paso: Cómo Aplicar las Reglas

Implementaremos la seguridad en **dos niveles**:
1. **Nivel Contenedor (Dentro de CT 105 y CT 103):** La regla vive directamente en la máquina de la base de datos (infalible e independiente).
2. **Nivel Hipervisor (En el Host Proxmox `192.168.56.100`):** El switch virtual intercepta y bloquea los paquetes en tránsito.

---

### PASO 1: Blindar MariaDB SQL en el Contenedor CT 105 (Puerto 3306)

Abre tu terminal (PowerShell en Windows o consola de Proxmox) y conéctate al contenedor de la base de datos:

```bash
ssh root@192.168.56.105
```
*(Contraseña: `proxmox`)*

Una vez dentro de `CT 105`, copia y pega estos comandos uno por uno:

#### 1.1. Permitir que el contenedor hable consigo mismo (Localhost):
```bash
iptables -A INPUT -i lo -j ACCEPT
```
*¿Qué hace?:* Permite que los procesos internos del propio CT 105 se comuniquen entre sí.

#### 1.2. Mantener abiertas las conexiones ya establecidas:
```bash
iptables -A INPUT -m conntrack --ctstate ESTABLISHED,RELATED -j ACCEPT
```
*¿Qué hace?:* Evita que el firewall te desconecte tu propia sesión de SSH mientras trabajas.

#### 1.3. Permitir SSH para administración:
```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
```
*¿Qué hace?:* Asegura que siempre puedas entrar por SSH al CT 105.

#### 1.4. LA REGLA DE ORO 1: Permitir conexión MySQL SOLO desde CT 102:
```bash
iptables -A INPUT -p tcp -s 192.168.56.102 --dport 3306 -j ACCEPT
```
*¿Qué hace?:* Abre el puerto `3306` **única y exclusivamente** si el paquete viene de la IP `192.168.56.102` (el Backend).

#### 1.5. LA REGLA DE ORO 2: Bloquear el puerto 3306 a todo el resto del mundo:
```bash
iptables -A INPUT -p tcp --dport 3306 -j REJECT --reject-with icmp-port-unreachable
```
*¿Qué hace?:* Si cualquier otra IP intenta tocar el puerto `3306`, el firewall le rechaza la conexión al instante diciéndole "Puerto inalcanzable".

#### 1.6. Guardar las reglas para que no se borren si el contenedor se reinicia:
```bash
apt-get update -y && apt-get install -y iptables-persistent
netfilter-persistent save
```
*(Si te sale una ventana azul en pantalla preguntando si deseas guardar las reglas IPv4 actuales, selecciona **<Yes>** con la tecla Enter).*

---

### PASO 2: Blindar Redis NoSQL en el Contenedor CT 103 (Puerto 6379)

Redis guarda las sesiones de usuario y está instalado en **CT 103**. Vamos a protegerlo igual:

Conéctate por SSH a CT 103:
```bash
ssh root@192.168.56.103
```
*(Contraseña: `proxmox`)*

Una vez dentro de `CT 103`, ejecuta:

#### 2.1. Permitir conexión a Redis desde el propio CT 103 (Localhost) y desde CT 102 (App):
```bash
# Permitir tráfico local del propio contenedor:
iptables -I INPUT 1 -i lo -j ACCEPT

# Permitir Redis (:6379) SOLO desde el Backend CT 102:
iptables -I INPUT 2 -p tcp -s 192.168.56.102 --dport 6379 -j ACCEPT

# Bloquear Redis (:6379) para cualquier otra máquina:
iptables -I INPUT 3 -p tcp --dport 6379 -j REJECT --reject-with icmp-port-unreachable
```

#### 2.2. Guardar las reglas permanentemente:
```bash
apt-get update -y && apt-get install -y iptables-persistent
netfilter-persistent save
```

---

### PASO 3: Blindaje a Nivel de Hipervisor (Host Proxmox `192.168.56.100`)

Para que el catedrático vea que el Firewall también opera en el núcleo del sistema operativo del servidor central (Proxmox), colocamos las reglas en el switch virtual `vmbr0`.

Conéctate al Host Proxmox:
```bash
ssh root@192.168.56.100
```
*(Contraseña: `proxmox`)*

Ejecuta:
```bash
# 1. Asegurar que el kernel inspeccione el tráfico del puente vmbr0:
modprobe br_netfilter 2>/dev/null || true
sysctl -w net.bridge.bridge-nf-call-iptables=1 2>/dev/null || true

# 2. En la cadena FORWARD: Permitir MySQL (3306) solo desde 102 hacia 105:
iptables -I FORWARD 1 -p tcp -s 192.168.56.102 -d 192.168.56.105 --dport 3306 -j ACCEPT
iptables -I FORWARD 2 -p tcp -d 192.168.56.105 --dport 3306 -j REJECT --reject-with icmp-port-unreachable

# 3. Permitir Redis (6379) solo desde 102 hacia 103:
iptables -I FORWARD 3 -p tcp -s 192.168.56.102 -d 192.168.56.103 --dport 6379 -j ACCEPT
iptables -I FORWARD 4 -p tcp -d 192.168.56.103 --dport 6379 -j REJECT --reject-with icmp-port-unreachable
```

---

## 🧪 4. La Prueba de Fuego (Cómo demostrárselo al Catedrático)

Esta es la parte más importante: cómo demostrar en 1 minuto que el aislamiento funciona al 100%.

### 🟢 Prueba 1: Demostrar que el Backend (CT 102) SÍ puede entrar

1. Conéctate a CT 102:
   ```bash
   ssh root@192.168.56.102
   ```
2. Prueba tocar el puerto de MySQL en CT 105:
   ```bash
   nc -zv 192.168.56.105 3306
   ```
   **Resultado esperado:**
   ```text
   Connection to 192.168.56.105 3306 port [tcp/mysql] succeeded! ✅
   ```
3. Prueba tocar el puerto de Redis en CT 103:
   ```bash
   nc -zv 192.168.56.103 6379
   ```
   **Resultado esperado:**
   ```text
   Connection to 192.168.56.103 6379 port [tcp/redis] succeeded! ✅
   ```
4. Abre la web `https://clinica.grupo2.os` en tu navegador: la página carga, permite iniciar sesión y consulta la base de datos sin problemas.

---

### 🔴 Prueba 2: Demostrar que CUALQUIER OTRA MÁQUINA es RECHAZADA

1. Conéctate a una máquina NO autorizada (por ejemplo, el servidor de correo **CT 104** o tu consola de **Windows**):
   ```bash
   ssh root@192.168.56.104
   ```
2. Intenta conectarte al puerto 3306 de MySQL en CT 105:
   ```bash
   nc -zv 192.168.56.105 3306
   ```
   **Resultado esperado:**
   ```text
   nc: connect to 192.168.56.105 port 3306 (tcp) failed: Connection refused ❌
   ```
   *(¡El firewall rechazó el paquete instantáneamente!)*

3. Intenta conectarte al puerto 6379 de Redis en CT 103:
   ```bash
   nc -zv 192.168.56.103 6379
   ```
   **Resultado esperado:**
   ```text
   nc: connect to 192.168.56.103 port 6379 (tcp) failed: Connection refused ❌
   ```

4. Ver las reglas y los paquetes bloqueados en vivo:
   Entra a CT 105 y corre:
   ```bash
   iptables -L INPUT -v -n --line-numbers
   ```
   Verás el contador de paquetes (`pkts`) subiendo en la regla de `REJECT`, demostrando que el firewall atrapó los intentos de intrusión.

---

## 🚨 5. Botón de Emergencia (Rollback / Cómo deshacerlo si algo falla)

Si por alguna razón necesitas reiniciar o quitar las restricciones para hacer pruebas temporales:

* **Para limpiar las reglas de CT 105:**
  ```bash
  ssh root@192.168.56.105 "iptables -F INPUT"
  ```
* **Para limpiar las reglas de CT 103:**
  ```bash
  ssh root@192.168.56.103 "iptables -F INPUT"
  ```
* **Para limpiar las reglas del Host Proxmox:**
  ```bash
  ssh root@192.168.56.100 "iptables -F FORWARD"
  ```
*(Esto deja los puertos abiertos nuevamente).*

---

## 📋 Resumen Rápido para Decirle al Catedrático

> *"Ingeniero, implementamos una política de seguridad de red basada en el principio de mínimo privilegio (*Defense in Depth*). La base de datos relacional MariaDB (puerto 3306) y la caché NoSQL Redis (puerto 6379) tienen denegación por defecto (*Default Deny*). Mediante reglas de `iptables`, únicamente el contenedor de la aplicación web (CT 102, `192.168.56.102`) tiene autorización de enlace TCP. Cualquier consulta externa proveniente de otros servidores o de la red local del aula es rechazada con un paquete ICMP port unreachable."*
