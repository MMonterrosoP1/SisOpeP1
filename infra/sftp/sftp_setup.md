# Servidor SFTP Seguro en CT 104

## Arquitectura y Configuración de Chroot Jail

* **Contenedor:** `CT 104` (`mail-sftp`) — `192.168.56.104:22`.
* **FQDN:** `sftp.grupo2.os`.
* **Mecanismo:** OpenSSH `internal-sftp` con aislamiento Chroot.

### Usuarios y Permisos

1. **Usuario de Consulta / Paciente (`paciente_sftp`):**
   * **Jaula Chroot:** `/home/sftp/paciente_sftp` (Permisos `root:root 755`).
   * **Blindaje de Solo Lectura:** Forzado mediante bandera `-R` en `/etc/ssh/sshd_config.d/sftp.conf`:
     ```text
     Match User paciente_sftp
         ChrootDirectory /home/sftp/paciente_sftp
         ForceCommand internal-sftp -R
         AllowTcpForwarding no
         X11Forwarding no
     ```
   * **Directorio de Descarga:** `/constancias/` (permite ver y descargar PDFs de reposo médico, pero rechaza subidas).

2. **Usuario de Backend Next.js (`backend_sftp`):**
   * Cuenta técnica con permisos de escritura para depósito de constancias generadas desde la API en CT 102.
   * Permisos grupales `775` asignados a `/home/sftp/paciente_sftp/constancias/`.
