#set page(
  paper: "us-letter",
  margin: (top: 1.8cm, bottom: 1.8cm, left: 2cm, right: 2cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(9pt, fill: rgb("#64748b"))[
        *Sistemas Operativos I — Proyecto 1* | Guía de Presentación: Integrante 4 (Andrés)
        #v(-2mm)
        #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
      ]
    ]
  },
  footer: context [
    #text(9pt, fill: rgb("#64748b"))[
      #line(length: 100%, stroke: 0.5pt + rgb("#cbd5e1"))
      #v(-2mm)
      #grid(
        columns: (1fr, 1fr),
        align(left)[Grupo 2 — `grupo2.os` | UMG 2026],
        align(right)[Página #counter(page).display("1 de 1", both: true)]
      )
    ]
  ]
)

#set text(
  font: ("Segoe UI", "Liberation Sans", "Arial"),
  size: 10pt,
  lang: "es",
  fill: rgb("#1e293b")
)

#set par(justify: true, leading: 0.65em)

// --- ENCABEZADO / PORTADILLA ---
#align(center)[
  #text(11pt, weight: "bold", fill: rgb("#1e3a8a"))[UNIVERSIDAD MARIANO GÁLVEZ DE GUATEMALA]\
  #text(9pt, fill: rgb("#475569"))[Facultad de Ingeniería en Sistemas de Información | Sistemas Operativos I]\
  #v(1mm)
  #text(17pt, weight: "bold", fill: rgb("#0f172a"))[Guía Operativa de Presentación]\
  #text(12pt, weight: "bold", fill: rgb("#2563eb"))[Integrante 4: Andrés — Servidor Mail (SMTP/IMAP) & SFTP Chroot]\
  #v(2mm)
]

#rect(width: 100%, fill: rgb("#f8fafc"), stroke: 1pt + rgb("#e2e8f0"), radius: 6pt, inset: 9pt)[
  #grid(
    columns: (1fr, 1fr),
    row-gutter: 6pt,
    [ *Grupo Asignado:* Grupo 2 (`grupo2.os`) ],
    [ *Tiempo Asignado:* ~2.5 - 3 minutos ],
    [ *Rol Principal:* Mail (SMTP/IMAP) & SFTP (CT 104) ],
    [ *Puntos Clave:* Correo Dual, Buzón Maildir, SFTP Jail (-R) ]
  )
]

#v(2mm)

// --- SECCIÓN 1: ARQUITECTURA GENERAL ---
== 1. Breve Explicación de la Arquitectura General
Para responder con solidez técnica ante las preguntas del catedrático, comprende dónde se sitúan tus servicios:

- *Hipervisor Central (Proxmox VE 8):* Corre en la laptop de Marvin (`192.168.56.100`) administrando 5 Contenedores Linux (LXC) sobre Debian 12 enlazados al switch virtual `vmbr0` (`192.168.56.0/24`). Los contenedores comparten el kernel del host mediante _namespaces_ y _cgroups_, aislando servicios de red con altísimo rendimiento de I/O.
- *Tu Rol y Contenedor (CT 104 — `192.168.56.104`):* Administras el *Servidor Central de Comunicaciones y Archivos Seguros*. Aloja tanto el sistema de correo electrónico dual (*Postfix SMTP* en puerto 25 y *Dovecot IMAP* en puerto 143) como el servidor de transferencia segura de archivos (*OpenSSH SFTP*) con aislamiento estricto en jaula _chroot_.
- *Interconexión de Servicios:*
  - *CT 101:* Resuelve los subdominios independientes `mail.grupo2.os` y `sftp.grupo2.os` apuntando a tu contenedor (`192.168.56.104`), además de definir el registro `MX`.
  - *CT 102 (Next.js):* Tras registrar una atención médica, dispara un socket TCP hacia tu puerto 25 para notificar al paciente y una conexión SFTP al puerto 22 para depositar la constancia PDF firmada.
  - *Clientes Finales:* El médico y paciente leen sus correos en tiempo real mediante Mozilla Thunderbird y descargan sus constancias médicas por SFTP en modo de solo lectura.

#v(2mm)
#align(center)[
  #image("diagrama_mail_sftp_ct104.svg", width: 92%)
  #v(-1mm)
  #text(8pt, fill: rgb("#64748b"), style: "italic")[
    Figura 4.1: Flujo de comunicaciones en CT 104 — Desacoplamiento de Postfix MTA y Dovecot MDA, formato Maildir y jaula SFTP con bandera -R.
  ]
]

#v(2mm)

// --- SECCIÓN 2: PANTALLAS PREVIAS ---
== 2. Pantallas que Debes Dejar Listas Antes de la Presentación
Ten abiertas y organizadas estas 3 ventanas en la máquina de demostración:
+ *Ventana 1 (Mozilla Thunderbird en Windows):* Abierto y sincronizado con la cuenta `paciente@grupo2.os` (Servidor IMAP `mail.grupo2.os:143`), con la bandeja de entrada limpia.
+ *Ventana 2 (Cliente SFTP / FileZilla o Terminal):* Conexión lista hacia `sftp.grupo2.os` (puerto 22) con el usuario `paciente_sftp` (clave `proxmox`).
+ *Ventana 3 (Terminal SSH hacia CT 104):* Conectada mediante `ssh root@192.168.56.104` (clave `proxmox`) lista para mostrar logs y configuraciones de seguridad.

#v(2mm)

// --- SECCIÓN 3: GUION PASO A PASO ---
== 3. Guion de Demostración en Vivo (Paso a Paso)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:00 - 0:45 | Paso 1: Recepción del Turno y Desacoplamiento de Servicios]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Buenas tardes, Ingeniero. Mi rol en el proyecto abarca la infraestructura de mensajería y el almacenamiento seguro de expedientes clínicos en el contenedor CT 104. En arquitecturas robustas de Sistemas Operativos separamos con precisión las funciones de transporte y entrega: Postfix actúa como MTA en el puerto 25 para recibir mensajes y depositarlos en disco, mientras que Dovecot opera como MDA en el puerto 143 para sincronizarlos con los clientes mediante el protocolo IMAP."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:45 - 1:30 | Paso 2: Verificación de Correo en Thunderbird y Formato Maildir]
  \
  *Qué hacer inmediatamente tras el clic de Aaron:*
  + Mostrar la pantalla de *Mozilla Thunderbird* en Windows.
  + Señalar la llegada instantánea del correo emitido por el backend para `paciente@grupo2.os`.
  + Abrir el correo para mostrar los detalles del diagnóstico y la notificación de constancia lista.
  \
  *Qué mostrar en la terminal de CT 104:*
  ```bash
  # 1. Inspeccionar el registro en tiempo real de la entrega en Postfix
  tail -n 8 /var/log/mail.log

  # 2. Demostrar el almacenamiento físico en formato Maildir
  ls -l /home/paciente/Maildir/new/
  ```
  \
  *Qué explicar al mostrar el archivo:* \
  #text(style: "italic")[
    "Destacamos el uso del formato Maildir en lugar del obsoleto mbox. Maildir guarda cada correo como un archivo individual e inmutable dentro de /home/paciente/Maildir/new/. Esto elimina la posibilidad de bloqueos de archivo por concurrencia a nivel de kernel de Linux y previene la corrupción de buzones ante accesos simultáneos."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 1:30 - 2:30 | Paso 3: Servidor SFTP Chroot Jail y Blindaje de Solo Lectura (-R)]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Para el resguardo de constancias y recetas médicas implementamos una jaula Chroot con OpenSSH. La jaula redefine la raíz del sistema de archivos en /home/sftp/paciente_sftp, impidiendo que el usuario pueda escalar o navegar hacia el árbol raíz de Linux mediante directory traversal."
  ]
  \
  *Qué hacer en vivo en el cliente SFTP (FileZilla o Terminal):*
  + Conectarse con `paciente_sftp` a `sftp.grupo2.os:22`.
  + Navegar a la carpeta `/constancias/` y descargar el PDF emitido en la consulta.
  + *Prueba de Fuego (Blindaje -R):* Intentar subir cualquier archivo desde el cliente hacia la carpeta.
  + Señalar en pantalla el rechazo inmediato del servidor: *'Upload failed / Permission denied'*.
  \
  *Qué mostrar en la terminal de CT 104:*
  ```bash
  # Mostrar la regla de blindaje con bandera -R en la configuración de SSH
  cat /etc/ssh/sshd_config.d/sftp.conf
  ```
  \
  *Qué explicar:* \
  #text(style: "italic")[
    "El secreto radica en la directiva 'ForceCommand internal-sftp -R'. Esta bandera instruye al subsistema SSH a operar en modo estricto de Solo Lectura para el paciente. Mientras tanto, el usuario automatizado 'backend_sftp' sí cuenta con privilegios de escritura para depositar los documentos generados por Next.js."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 2:30 - 3:00 | Paso 4: Cierre y Pase hacia Marvin (Líder / DevSecOps)]
  \
  *Qué decir para transferir la palabra:* \
  #text(style: "italic")[
    "Habiendo verificado la entrega del correo electrónico vía IMAP y la custodia segura de constancias médicas bajo políticas de privilegios mínimos en SFTP, cedo la palabra a Marvin, líder del proyecto, quien demostrará la seguridad perimetral, el aislamiento estricto de base de datos y la gestión del monorepo grupal."
  ]
]

#v(2mm)

// --- SECCIÓN 4: CONTINGENCIA ---
== 4. Guía de Contingencia Rápida (Solución en 10 Segundos)

#table(
  columns: (1.2fr, 1.2fr, 1.6fr),
  fill: (x, y) => if y == 0 { rgb("#f1f5f9") } else { none },
  stroke: 0.5pt + rgb("#cbd5e1"),
  align: (left, left, left),
  table.header(
    [*Problema en Vivo*], [*Causa Raíz*], [*Solución Inmediata*]
  ),
  [El correo no aparece en Thunderbird.],
  [La sincronización IMAP está en pausa.],
  [Presionar `F5` o el botón *'Recibir Mensajes'* en Thunderbird. En CT 104 validar: `systemctl restart dovecot`.],
  
  [SFTP devuelve `Connection refused`.],
  [Servicio OpenSSH detenido o reiniciándose.],
  [En CT 104 ejecutar: `systemctl restart ssh && systemctl status ssh`.],
  
  [Error `fatal: bad ownership or modes for chroot`.],
  [Permisos incorrectos en la carpeta raíz del chroot.],
  [En CT 104 asegurar que el directorio padre pertenezca a root: `chown root:root /home/sftp/paciente_sftp && chmod 755 /home/sftp/paciente_sftp`.],
  
  [Falla la autenticación de `paciente_sftp`.],
  [Contraseña expirada o mal ingresada.],
  [Restablecer clave en 5 segundos en CT 104: `echo "paciente_sftp:proxmox" | chpasswd`.]
)
