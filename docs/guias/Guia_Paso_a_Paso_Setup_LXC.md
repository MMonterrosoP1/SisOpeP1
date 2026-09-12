# 🚀 Guía de Ejecución Directa: Setup de Contenedores Proxmox VE 8
> **Curso:** Sistemas Operativos I — Proyecto 1  
> **Ubicación de archivos:** `C:\Users\marvi\Documents\Universidad\2026 - 2do Semestre\Sistemas Operativos I\Proyecto_1\`  
> **Carpeta compartida dentro de la VM:** `/vagrant/`

---

## 💡 ¿Cómo funciona esta automatización?

Como estás usando **Vagrant**, la carpeta de Windows donde tienes tus archivos se monta automáticamente dentro de la máquina virtual en la ruta **`/vagrant`**.

Por lo tanto, **no necesitas copiar y pegar scripts largos en la terminal**. Ya he creado los archivos ejecutables `.sh` dentro de tu carpeta. Solo debes correr **3 comandos de una sola línea**.

---

## 🛠️ Pasos de Ejecución (En la terminal `root@pve:~#`)

### 1️⃣ Paso 1: Configurar la Red Virtual (`vmbr0`) con Internet
Ejecuta:
```bash
bash /vagrant/1_setup_network.sh
```
*Salida esperada:* Mensaje confirmando que `vmbr0` está UP con IP `192.168.56.1/24` y NAT hacia Internet.

---

### 2️⃣ Paso 2: Descargar la Plantilla Debian 12
Ejecuta:
```bash
bash /vagrant/2_download_template.sh
```
*Salida esperada:* Proceso de descarga oficial de Proxmox mostrando el archivo `debian-12-standard_...tar.zst` en `/var/lib/vz/template/cache/`.

---

### 3️⃣ Paso 3: Crear los 4 Contenedores del Proyecto
Ejecuta:
```bash
bash /vagrant/3_create_containers.sh
```
*Salida esperada:* Creación y encendido automático de los contenedores `101`, `102`, `103` y `104`, finalizando con la tabla de `pct list`.

---

## 🔍 Comandos de Verificación y Uso Diario

| Acción | Comando |
| :--- | :--- |
| **Ver todos los contenedores** | `pct list` |
| **Entrar al CT 101 (DNS & DHCP)** | `pct enter 101` |
| **Entrar al CT 102 (App Server Next.js)** | `pct enter 102` |
| **Entrar al CT 103 (Nginx Web Proxy & SSL)** | `pct enter 103` |
| **Entrar al CT 104 (Mail & SFTP)** | `pct enter 104` |
| **Entrar al CT 105 (Base de Datos Híbrida)** | `pct enter 105` |
| **Salir de un contenedor a Proxmox** | `exit` |
| **Probar Internet dentro de un contenedor** | `pct enter 101` $\rightarrow$ `ping -c 3 8.8.8.8` $\rightarrow$ `exit` |

---

## 🌐 Acceso a la Interfaz Gráfica (Web GUI)
* **URL:** [https://localhost:8006](https://localhost:8006) o [https://192.168.56.100:8006](https://192.168.56.100:8006)
* **Usuario:** `root`
* **Contraseña:** `proxmox`
