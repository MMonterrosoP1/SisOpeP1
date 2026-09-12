# 🛠️ Guía Paso a Paso: Reparación de Certificados SSL y Acceso Web GUI (Proxmox VE 8)
> **Curso:** Sistemas Operativos I — Proyecto 1  
> **Problema:** El puerto `8006` no responde debido a certificados SSL faltantes en `/etc/pve/nodes/pve/`.  
> **Objetivo:** Generar las llaves y certificados requeridos y restaurar la interfaz web.

---

## ⚡ Método 1: Ejecución Directa en 1 Línea (Recomendado)

Desde tu terminal `root@pve:~#`, corre el script que ya preparé en la carpeta compartida:

```bash
bash /vagrant/5_fix_pve_certs.sh
```

---

## 📋 Método 2: Ejecución Paso a Paso por Comandos Separados

Si prefieres ejecutar cada instrucción de forma manual y controlada:

### 🔹 Paso 1: Crear carpetas del sistema
```bash
mkdir -p /etc/pve/nodes/pve /etc/pve/priv
```

---

### 🔹 Paso 2: Generar la Autoridad Certificadora (Root CA)
```bash
openssl genrsa -out /etc/pve/priv/pve-root-ca.key 2048
openssl req -batch -x509 -new -nodes -key /etc/pve/priv/pve-root-ca.key -sha256 -days 3650 -out /etc/pve/pve-root-ca.pem -subj "/CN=Proxmox Virtual Environment Root CA"
```

---

### 🔹 Paso 3: Generar la Llave y Certificado SSL del Nodo Proxmox
```bash
openssl genrsa -out /etc/pve/nodes/pve/pve-ssl.key 2048
openssl req -batch -new -x509 -key /etc/pve/nodes/pve/pve-ssl.key -sha256 -days 3650 -out /etc/pve/nodes/pve/pve-ssl.pem -subj "/CN=pve.grupo.os"
```

---

### 🔹 Paso 4: Generar la Llave de Autenticación del Cluster
```bash
openssl genrsa -out /etc/pve/priv/authkey.key 2048
openssl rsa -in /etc/pve/priv/authkey.key -pubout -out /etc/pve/authkey.pub
```

---

### 🔹 Paso 5: Ajustar Permisos y Reiniciar el Servidor Web
```bash
chmod 600 /etc/pve/priv/*.key /etc/pve/nodes/pve/*.key 2>/dev/null || true
pvecm updatecerts -f || true
systemctl restart pvedaemon pveproxy
```

---

### 🔹 Paso 6: Verificar que el puerto 8006 está activo
```bash
ss -tulpn | grep 8006
```
*Salida esperada:*
```text
tcp   LISTEN 0      128          0.0.0.0:8006       0.0.0.0:*    users:(("pveproxy",pid=...))
```

---

## 🌐 Paso 7: Ingresar desde tu Navegador Web en Windows

1. Abre en tu navegador de Windows:
   * 👉 **[https://localhost:8006](https://localhost:8006)** o **`https://192.168.56.100:8006`**
2. Haz clic en **"Configuración avanzada"** $\rightarrow$ **"Continuar a localhost (no seguro)"**.
3. Credenciales de acceso:
   * **User name:** `root`
   * **Password:** `proxmox`
   * **Realm:** `Linux PAM standard authentication`
