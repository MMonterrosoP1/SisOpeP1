#set page(
  paper: "us-letter",
  margin: (top: 1.8cm, bottom: 1.8cm, left: 2cm, right: 2cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(9pt, fill: rgb("#64748b"))[
        *Sistemas Operativos I — Proyecto 1* | Guía de Presentación: Integrante 3 (Aaron)
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
  #text(12pt, weight: "bold", fill: rgb("#2563eb"))[Integrante 3: Aaron — Aplicación Fullstack, PM2 & Flujo Clínico]\
  #v(2mm)
]

#rect(width: 100%, fill: rgb("#f8fafc"), stroke: 1pt + rgb("#e2e8f0"), radius: 6pt, inset: 9pt)[
  #grid(
    columns: (1fr, 1fr),
    row-gutter: 6pt,
    [ *Grupo Asignado:* Grupo 2 (`grupo2.os`) ],
    [ *Tiempo Asignado:* ~2.5 - 3 minutos ],
    [ *Rol Principal:* App Fullstack & PM2 (CT 102) ],
    [ *Puntos Clave:* PM2 Daemon, Better Auth, Flujo E2E ]
  )
]

#v(2mm)

// --- SECCIÓN 1: ARQUITECTURA GENERAL ---
== 1. Breve Explicación de la Arquitectura General
Para justificar el funcionamiento del backend ante las preguntas del catedrático, comprende cómo se enlaza tu servidor con la infraestructura:

- *Hipervisor Central (Proxmox VE 8):* Corre en la laptop de Marvin (`192.168.56.100`) orquestando 5 Contenedores Linux (LXC) sobre Debian 12 enlazados al switch virtual `vmbr0` (`192.168.56.0/24`). A diferencia de máquinas virtuales completas, los contenedores LXC comparten el kernel del host mediante _namespaces_ y _cgroups_, permitiendo ejecutar Node.js en producción con máxima eficiencia de recursos.
- *Tu Rol y Contenedor (CT 102 — `192.168.56.102`):* Administras el *Servidor de Aplicación Fullstack Next.js*. La app corre en producción en `/var/www/proyecto-grupo2` bajo el gestor de procesos en segundo plano *PM2*. Tu contenedor no expone puertos al exterior; recibe el tráfico web filtrado desde Nginx (*CT 103*) en el puerto local `:3000` y orquesta de forma asíncrona la persistencia en base de datos, el envío de correos y el depósito de archivos en SFTP.
- *Interconexión de Servicios:*
  - *Desde CT 103 (Nginx):* Recibes las peticiones con la cabecera `X-Forwarded-Proto https`.
  - *Hacia CT 105 (MariaDB SQL):* Persistes pacientes, citas y diagnósticos mediante *Prisma ORM* por el puerto TCP `3306`.
  - *Hacia CT 103 (Redis NoSQL):* Gestionas sesiones y tokens de autenticación en memoria en el puerto `6379`.
  - *Hacia CT 104 (Mail & SFTP):* Disparas notificaciones por socket TCP `:25` (Postfix) y subes constancias PDF cifradas vía túnel SFTP `:22`.

#v(2mm)
#align(center)[
  #image("diagrama_nextjs_app_flujo.svg", width: 92%)
  #v(-1mm)
  #text(8pt, fill: rgb("#64748b"), style: "italic")[
    Figura 3.1: Arquitectura interna de CT 102 — PM2 Daemon, Better Auth y orquestación multi-servicio del flujo clínico.
  ]
]

#v(2mm)

// --- SECCIÓN 2: PANTALLAS PREVIAS ---
== 2. Pantallas que Debes Dejar Listas Antes de la Presentación
Ten abiertas y organizadas estas 3 ventanas en la máquina de demostración:
+ *Ventana 1 (Navegador Web):* `https://clinica.grupo2.os` abierto en pantalla de inicio de sesión (`/sign-in`).
+ *Ventana 2 (Terminal SSH hacia CT 102):* Conectada mediante `ssh root@192.168.56.102` (clave `proxmox`), ubicada en `/var/www/proyecto-grupo2` y lista para ejecutar comandos de PM2.
+ *Ventana 3 (Credenciales a Mano):* Usuario médico `medico@grupo2.os` y contraseña `12345678` anotados o memorizados.

#v(2mm)

// --- SECCIÓN 3: GUION PASO A PASO ---
== 3. Guion de Demostración en Vivo (Paso a Paso)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:00 - 0:45 | Paso 1: Gestión de Procesos en SO con PM2 Daemon]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Buenas tardes, Ingeniero. Mi rol en el proyecto es la aplicación fullstack y la orquestación de la lógica médica. En entornos de producción reales de Sistemas Operativos, una aplicación web no se ejecuta manualmente en una consola interactiva, sino como un servicio persistente o daemon en segundo plano. Para ello implementamos PM2 en CT 102."
  ]
  \
  *Qué mostrar en la terminal de CT 102:*
  ```bash
  # Mostrar el estado, consumo de memoria y uptime del proceso en producción
  pm2 status
  ```
  \
  *Qué explicar al mostrar la tabla de PM2:* \
  #text(style: "italic")[
    "Aquí observamos el proceso 'clinica' con estado online, escuchando en el socket interno 3000. PM2 garantiza tolerancia a fallos: si una excepción crítica ocurre en Node.js, el kernel recibe la señal y PM2 levanta el hilo en milisegundos sin interrumpir el servicio clínico."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:45 - 1:30 | Paso 2: Autenticación Segura (Better Auth) y Middleware Local]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "La seguridad de acceso opera mediante Better Auth. Cuando el usuario se autentica, la sesión se valida mediante tokens criptográficos. Para optimizar el rendimiento y evitar llamadas recursivas por HTTPS sobre la red, ajustamos el middleware interno para validar sesiones directamente contra http://127.0.0.1:3000 con latencia de 0 ms."
  ]
  \
  *Qué hacer en vivo en el navegador:*
  + Ingresar correo `medico@grupo2.os` y clave `12345678`.
  + Presionar *Iniciar Sesión* y mostrar el acceso inmediato al Dashboard Clínico con la sesión activa del profesional de la salud.
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 1:30 - 2:30 | Paso 3: Flujo Clínico E2E y Reacción en Cadena del SO]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "A continuación demostramos una consulta médica real. Este módulo representa el núcleo del sistema y dispara una reacción en cadena a través de múltiples protocolos de red del sistema operativo."
  ]
  \
  *Qué hacer en la interfaz web:*
  + Seleccionar un paciente existente o ingresar datos rápidos de uno nuevo.
  + En el formulario de atención médica: ingresar signos vitales, registrar el diagnóstico clínico (ej. _Faringoamigdalitis aguda_) y prescribir medicamentos.
  + Presionar el botón principal: *'Generar Constancia Médica y Notificar'*.
  \
  *Qué explicar inmediatamente después del clic:* \
  #text(style: "italic")[
    "En este instante, el backend acaba de ejecutar cuatro operaciones simultáneas a nivel de SO:
    1. Prisma ORM confirmó la transacción ACID en el puerto 3306 de MariaDB (CT 105).
    2. El motor del backend compiló y firmó digitalmente la constancia médica en formato PDF.
    3. Se abrió un socket TCP saliente hacia el puerto 25 de CT 104 para enviar la notificación por correo al paciente.
    4. Mediante el protocolo SSH/SFTP (puerto 22), se depositó el PDF en la jaula chroot segura de CT 104."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 2:30 - 3:00 | Paso 4: Pase de Demostración hacia el Integrante 4]
  \
  *Qué decir para transferir la palabra:* \
  #text(style: "italic")[
    "Para verificar que las comunicaciones asíncronas y el almacenamiento seguro se completaron con total integridad en los servidores destinatarios, cedo la palabra a mi compañero [Integrante 4], quien demostrará la recepción del correo en Thunderbird y la descarga de la constancia en el servidor SFTP."
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
  [La aplicación devuelve `500 Internal Error`.],
  [Variables de entorno desfasadas tras reinicio.],
  [En la terminal de CT 102 ejecutar: `pm2 restart clinica --update-env`. Esperar 5 segundos.],
  
  [Falla la conexión con la base de datos.],
  [Contenedor CT 105 detenido o MariaDB caído.],
  [Verificar en Proxmox que CT 105 esté en verde. En CT 102 probar socket: `nc -zv 192.168.56.105 3306`.],
  
  [Better Auth rechaza la autenticación.],
  [Desfase en el reloj del sistema del contenedor.],
  [En CT 102 ejecutar `date` para verificar hora. Si difiere: `chronyd -q 'server pool.ntp.org iburst'`.],
  
  [PM2 no reconoce el comando en terminal.],
  [Ruta absoluta de binarios de Node no enlazada.],
  [Ejecutar con ruta completa: `/opt/node-v20.18.0-linux-x64/bin/pm2 status`. O enlazar: `ln -sf /opt/node-v20.18.0-linux-x64/bin/* /usr/bin/`.]
)
