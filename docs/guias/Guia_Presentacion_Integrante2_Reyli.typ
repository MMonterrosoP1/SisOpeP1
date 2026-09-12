#set page(
  paper: "us-letter",
  margin: (top: 1.8cm, bottom: 1.8cm, left: 2cm, right: 2cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(9pt, fill: rgb("#64748b"))[
        *Sistemas Operativos I — Proyecto 1* | Guía de Presentación: Integrante 2 (Reyli)
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
  #text(12pt, weight: "bold", fill: rgb("#2563eb"))[Integrante 2: Reyli — Servidor Web, Nginx Reverse Proxy & SSL/TLS]\
  #v(2mm)
]

#rect(width: 100%, fill: rgb("#f8fafc"), stroke: 1pt + rgb("#e2e8f0"), radius: 6pt, inset: 9pt)[
  #grid(
    columns: (1fr, 1fr),
    row-gutter: 6pt,
    [ *Grupo Asignado:* Grupo 2 (`grupo2.os`) ],
    [ *Tiempo Asignado:* ~2.5 - 3 minutos ],
    [ *Rol Principal:* Web, Reverse Proxy y SSL (CT 103) ],
    [ *Puntos Clave:* Redirección 301, Terminación SSL, Proxy Pass ]
  )
]

#v(2mm)

// --- SECCIÓN 1: ARQUITECTURA GENERAL ---
== 1. Breve Explicación de la Arquitectura General
Para responder con solvencia técnica ante las preguntas del catedrático, comprende dónde encaja tu servicio dentro del ecosistema:

- *Hipervisor Central (Proxmox VE 8):* Corre en la laptop de Marvin (`192.168.56.100`) orquestando 5 Contenedores Linux (LXC) sobre Debian 12 enlazados al switch virtual `vmbr0` (`192.168.56.0/24`). Los contenedores comparten el kernel del host mediante _namespaces_ y _cgroups_, permitiendo aislar la capa web sin el peso de una máquina virtual completa.
- *Tu Rol y Contenedor (CT 103 — `192.168.56.103`):* Administras el *Servidor Web Nginx* actuando como *Reverse Proxy* y punto único de entrada web al sistema. Tu contenedor centraliza la terminación SSL/TLS y protege al servidor de aplicación (*CT 102*), evitando que el backend exponga puertos HTTP directamente al exterior.
- *Interconexión de Servicios:*
  - *CT 101:* Resuelve el dominio autoritativo `clinica.grupo2.os` apuntando a la IP de tu contenedor (`192.168.56.103`).
  - *CT 103 (Tu contenedor):* Recibe peticiones en puertos 80 y 443, fuerza HTTPS, descifra el tráfico TLS y lo deriva mediante socket interno hacia `http://192.168.56.102:3000`. *(También aloja el servidor Redis NoSQL en el puerto 6379)*.
  - *CT 102:* Servidor Next.js que procesa la lógica de la clínica y confía en las cabeceras `X-Forwarded-Proto` que tú le inyectas.

#v(2mm)
#align(center)[
  #image("diagrama_nginx_ssl_proxy.svg", width: 92%)
  #v(-1mm)
  #text(8pt, fill: rgb("#64748b"), style: "italic")[
    Figura 2.1: Flujo de tráfico web — Redirección 301 forzada, terminación SSL TLSv1.3 en CT 103 y Reverse Proxy hacia CT 102 (:3000).
  ]
]

#v(2mm)

// --- SECCIÓN 2: PANTALLAS PREVIAS ---
== 2. Pantallas que Debes Dejar Listas Antes de la Presentación
Ten abiertas y organizadas estas ventanas en la máquina de demostración:
+ *Ventana 1 (Navegador Web en el Cliente):* Ventana limpia lista para navegar a `http://clinica.grupo2.os` (puedes presionar `F12` y dejar abierta la pestaña *Network* para mostrar las cabeceras en vivo).
+ *Ventana 2 (Terminal SSH hacia CT 103):* Conectada mediante `ssh root@192.168.56.103` (clave `proxmox`) y ubicada en `/etc/nginx/sites-available/`.
+ *Ventana 3 (Terminal de Pruebas / Cliente):* Lista para ejecutar consultas con `curl` hacia el servidor web.

#v(2mm)

// --- SECCIÓN 3: GUION PASO A PASO ---
== 3. Guion de Demostración en Vivo (Paso a Paso)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:00 - 0:45 | Paso 1: Recepción del Turno y Rol del Reverse Proxy]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Buenas tardes, Ingeniero. Mi rol en el proyecto es la ingeniería web, la seguridad en la capa de transporte y el proxy inverso. Tras la resolución de nombres demostrada por Wilson, todo el tráfico web dirigido a clinica.grupo2.os ingresa a nuestro contenedor CT 103. En lugar de exponer el servidor de aplicaciones directamente a la red, implementamos Nginx como Reverse Proxy. Este patrón de arquitectura nos permite desacoplar la terminación SSL del código de negocio, balancear cargas y mitigar vectores de ataque directos al backend."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:45 - 1:30 | Paso 2: Redirección Forzada HTTP (80) a HTTPS (443)]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Como estándar riguroso de seguridad clínica, el sistema rechaza cualquier comunicación no cifrada. Configuramos en Nginx una regla estricta que intercepta el puerto 80 y emite un código de estado HTTP 301 Moved Permanently hacia el esquema seguro HTTPS."
  ]
  \
  *Qué hacer en vivo:*
  + *En el Navegador:* Escribir en la barra de URL `http://clinica.grupo2.os` (enfatizar el `http://` sin la 's') y dar Enter. Mostrar cómo el navegador es redirigido inmediatamente a `https://clinica.grupo2.os` mostrando el candado seguro.
  + *En la Terminal (Demostración de Cabeceras HTTP):*
  ```bash
  # Demostrar la redirección HTTP 301 inmediata en el puerto 80
  curl -I http://clinica.grupo2.os
  ```
  \
  *Qué señalar al mostrar la salida de curl:* \
  #text(style: "italic")[
    "Como se aprecia en la respuesta del servidor, Nginx devuelve el encabezado HTTP/1.1 301 Moved Permanently con la cabecera Location apuntando a https://clinica.grupo2.os/."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 1:30 - 2:15 | Paso 3: Certificados Criptográficos SSL/TLS y CA Local]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Para proteger el canal de transporte, creamos una Autoridad Certificadora (CA) local mediante OpenSSL y emitimos un certificado digital X.509 para clinica.grupo2.os con soporte para protocolos modernos TLSv1.2 y TLSv1.3."
  ]
  \
  *Qué mostrar en vivo (En la terminal de CT 103):*
  ```bash
  # 1. Mostrar las llaves y certificados en el almacenamiento seguro de Nginx
  ls -la /etc/nginx/ssl/

  # 2. Inspeccionar la validez criptográfica y el Subject del certificado
  openssl x509 -in /etc/nginx/ssl/clinica.grupo2.os.crt -noout -subject -issuer -dates
  ```
  \
  *Qué explicar al mostrar la salida:* \
  #text(style: "italic")[
    "Aquí validamos que el certificado fue emitido para el Common Name clinica.grupo2.os, con permisos estrictos 600 en la llave privada y 644 en el certificado público, asegurando la confidencialidad de la clave del servidor."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 2:15 - 3:00 | Paso 4: Reverse Proxy Pass e Inyección de Cabeceras Seguras]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Una vez que Nginx efectúa el handshake TLS y descifra la petición del cliente, la deriva de forma transparente hacia el contenedor CT 102 donde corre Next.js en el puerto interno 3000."
  ]
  \
  *Qué mostrar en la terminal de CT 103:*
  ```bash
  # Inspeccionar el bloque de proxy inverso en el Virtual Host
  cat /etc/nginx/sites-available/clinica.grupo2.os | grep -A 10 "location /"
  ```
  \
  *Qué explicar de la configuración:* \
  #text(style: "italic")[
    "Destacamos tres elementos clave a nivel de SO y redes:
    1. proxy_pass hacia http://192.168.56.102:3000 a través del switch virtual vmbr0.
    2. La inyección de X-Forwarded-Proto https, fundamental para que el framework de autenticación (Better Auth) sepa que la sesión es segura.
    3. La cabecera X-Real-IP con la dirección real del cliente para auditoría de accesos.
    Con la capa web cifrada y el túnel establecido, cedo la palabra a mi compañero, quien presentará la aplicación en producción y el flujo clínico en vivo."
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
  [Nginx devuelve `502 Bad Gateway`.],
  [El proceso de Next.js en CT 102 no ha levantado en el puerto 3000.],
  [Pedir al Integrante 3 ejecutar en CT 102: `pm2 restart clinica` o revisar `pm2 logs`. Esperar 5 segundos.],
  
  [La página no carga (`Connection refused`).],
  [El servicio Nginx en CT 103 está detenido.],
  [En la terminal de CT 103 ejecutar: `systemctl restart nginx && systemctl status nginx`.],
  
  [El navegador muestra advertencia de certificado autofirmado.],
  [Es el comportamiento esperado para una CA local privada.],
  [Hacer clic en *Avanzado $arrow.r$ Continuar a clinica.grupo2.os (no seguro)*. Explicar al catedrático que la CA local certifica cifrado TLS íntegro en LAN.],
  
  [Error de sintaxis tras editar configuración.],
  [Falta punto y coma o directiva errónea.],
  [Ejecutar `nginx -t` para validar la sintaxis exacta del archivo de configuración antes de reiniciar el servicio.]
)
