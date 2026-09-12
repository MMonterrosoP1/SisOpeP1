#set page(
  paper: "us-letter",
  margin: (top: 2cm, bottom: 2cm, left: 2.2cm, right: 2.2cm),
  header: context {
    if counter(page).get().first() > 1 [
      #text(9pt, fill: rgb("#64748b"))[
        *Sistemas Operativos I — Proyecto 1* | Guía de Presentación: Integrante 1 (Wilson)
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
  #text(12pt, weight: "bold", fill: rgb("#2563eb"))[Integrante 1: Wilson — Infraestructura de Red, OPNsense & DNS]\
  #v(2mm)
]

#rect(width: 100%, fill: rgb("#f8fafc"), stroke: 1pt + rgb("#e2e8f0"), radius: 6pt, inset: 9pt)[
  #grid(
    columns: (1fr, 1fr),
    row-gutter: 6pt,
    [ *Grupo Asignado:* Grupo 2 (`grupo2.os`) ],
    [ *Tiempo Asignado:* ~3.5 minutos ],
    [ *Rol Principal:* Líder de Red, OPNsense y CT 101 ],
    [ *Puntos Extra a Defender:* DHCP Local, Blacklist, Subdominios .os ]
  )
]

#v(2mm)

// --- SECCIÓN 1: ARQUITECTURA GENERAL ---
== 1. Breve Explicación de la Arquitectura General
Para responder con solidez y propiedad técnica ante las preguntas del catedrático, comprende la arquitectura completa del proyecto:

- *Hipervisor Central (Proxmox VE 8):* Desplegado en la laptop de Marvin (`192.168.56.100`) orquestando 5 Contenedores Linux (LXC) sobre Debian 12 enlazados al switch virtual `vmbr0` (`192.168.56.0/24`). A diferencia de máquinas virtuales completas, los contenedores LXC comparten el kernel del host mediante _namespaces_ y _cgroups_, reduciendo drásticamente el consumo de RAM/CPU.
- *Tu Rol y Perímetro (Laptop de Wilson):* Tu máquina ejecuta *OPNsense* (`192.168.56.1`) como Router, Gateway perimetral y Servidor DHCP. Está conectada por cable a un Mini-Switch Gigabit físico, interconectando la laptop de Marvin y un Access Point *Ubiquiti UniFi nanoHD* (alimentado por inyector PoE) que emite la red Wi-Fi `Grupo2_Clinica`.
- *Interconexión de Servicios:*
  - *CT 101 (Tu contenedor):* DNS BIND9 autoritativo para la zona `grupo2.os` (`192.168.56.101`).
  - *CT 102:* Aplicación Web Fullstack Next.js con PM2 (`192.168.56.102:3000`).
  - *CT 103:* Reverse Proxy Nginx SSL (`192.168.56.103:443`) y Redis NoSQL (`:6379`).
  - *CT 104:* Servidor de Correo Postfix SMTP/Dovecot IMAP y SFTP enjaulado (`192.168.56.104`).
  - *CT 105:* Base de Datos Relacional MariaDB SQL (`192.168.56.105:3306`).

#v(2mm)
#align(center)[
  #image("diagrama_red_topologia.svg", width: 100%)
  #v(-1mm)
  #text(8pt, fill: rgb("#64748b"), style: "italic")[
    Figura 1.1: Topología de red física y virtual — Hardware en el aula, Gateway OPNsense y Contenedores LXC en Proxmox VE 8.
  ]
]

#v(2mm)

// --- SECCIÓN 2: PANTALLAS PREVIAS ---
== 2. Pantallas que Debes Dejar Listas Antes de la Presentación
Ten abiertas estas 4 pestañas/ventanas en tu laptop con OPNsense activo:
+ *Pestaña 1 (Navegador):* OPNsense Web GUI en `https://192.168.56.1` $arrow.r$ *Services $arrow.r$ DHCPv4 $arrow.r$ Leases* (Tabla de clientes conectados).
+ *Pestaña 2 (Navegador):* OPNsense Web GUI $arrow.r$ *Firewall $arrow.r$ Log Files $arrow.r$ Live View* (Para ver el bloqueo de paquetes en vivo).
+ *Pestaña 3 (Navegador):* OPNsense Web GUI $arrow.r$ *Firewall $arrow.r$ Rules $arrow.r$ LAN* (Donde está configurada la regla de Blacklist).
+ *Ventana de Terminal (PowerShell o Bash):* Lista para ejecutar los comandos de verificación `nslookup`.

#v(2mm)

// --- SECCIÓN 3: GUION PASO A PASO ---
== 3. Guion de Demostración en Vivo (Paso a Paso)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:00 - 0:45 | Paso 1: Hardware y Red Física]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Buenas tardes, Ingeniero. Mi responsabilidad en el proyecto abarca la infraestructura de red física, el enrutamiento perimetral y la resolución autoritativa de nombres. Para garantizar total autonomía e independencia de la red universitaria, desplegamos nuestra propia infraestructura física: interconectamos mediante un Mini-Switch Gigabit las máquinas de servidores y mi laptop con OPNsense. Además, mediante un inyector PoE energizamos este Access Point Ubiquiti UniFi nanoHD, emitiendo el SSID Grupo2_Clinica para que cualquier cliente en el aula acceda directamente a los servicios."
  ]
  \
  *Acción visual:* Señalar el Mini-Switch, el inyector PoE y el AP Ubiquiti con su anillo LED activo.
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 0:45 - 1:45 | Paso 2: OPNsense como Gateway y Servidor DHCP (Puntos Extra)]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "En mi laptop corre OPNsense actuando como Gateway predeterminado en 192.168.56.1/24. Cumpliendo con los requisitos de innovación, implementamos el Servidor DHCP Local para entregar direccionamiento dinámico."
  ]
  \
  *Qué mostrar en pantalla:* Abrir la pestaña *Services $arrow.r$ DHCPv4 $arrow.r$ Leases*.
  \
  *Qué explicar al mostrar la pantalla:* \
  #text(style: "italic")[
    "Aquí observamos las concesiones activas: los clientes reciben IPs dentro del pool 192.168.56.200 al .250, máscara /24, gateway 192.168.56.1 y, como punto clave de arquitectura, se les inyecta automáticamente el Servidor DNS Primario 192.168.56.101, correspondiente a nuestro contenedor LXC con BIND9."
  ]
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 1:45 - 2:30 | Paso 3: Demostración de Lista Negra / Blacklist (Puntos Extra)]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "Para robustecer la seguridad perimetral configuramos una Lista Negra (Blacklist) a nivel de Firewall en OPNsense. Esta regla intercepta y descarta tráfico saliente no autorizado hacia dominios o IPs externas no permitidas en un entorno clínico."
  ]
  \
  *Qué hacer en vivo:*
  + Mostrar en *Firewall $arrow.r$ Rules $arrow.r$ LAN* la regla que bloquea el tráfico no deseado.
  + Cambiar a *Firewall $arrow.r$ Log Files $arrow.r$ Live View*.
  + Desde un celular o máquina cliente, intentar consultar el dominio bloqueado o lanzar un `ping`/`curl`.
  + Señalar la línea en *rojo* con la acción *`block/drop`* demostrando cómo el kernel de OPNsense descarta los paquetes en tiempo real.
]

#v(2mm)

#rect(width: 100%, fill: rgb("#eff6ff"), stroke: 1pt + rgb("#bfdbfe"), radius: 4pt, inset: 8pt)[
  #text(weight: "bold", fill: rgb("#1e40af"))[⏱️ Minuto 2:30 - 3:30 | Paso 4: DNS BIND9 y Subdominios por Protocolo (CT 101)]
  \
  *Qué decir:* \
  #text(style: "italic")[
    "En Proxmox levantamos el contenedor dedicado CT 101 con BIND9, configurado como servidor autoritativo para la zona oficial grupo2.os. Para obtener la máxima puntuación de innovación, implementamos Subdominios por Protocolo, mapeando cada servicio a su propio FQDN."
  ]
  \
  *Comandos a ejecutar en la terminal (Tenerlos listos):*
  ```bash
  # 1. Subdominio Web/Proxy (Redirige al Reverse Proxy Nginx en CT 103)
  nslookup clinica.grupo2.os 192.168.56.101

  # 2. Subdominio de Correo (Apunta a Postfix/Dovecot en CT 104)
  nslookup mail.grupo2.os 192.168.56.101

  # 3. Subdominio SFTP (Apunta al Servidor de Expedientes en CT 104)
  nslookup sftp.grupo2.os 192.168.56.101

  # 4. Subdominio de Base de Datos (Apunta a MariaDB en CT 105)
  nslookup db.grupo2.os 192.168.56.101

  # 5. Registro MX (Intercambiador de Correo oficial del dominio)
  nslookup -type=mx grupo2.os 192.168.56.101
  ```
  \
  *Frase de cierre y pase:* \
  #text(style: "italic")[
    "Como se aprecia, cada protocolo tiene su subdominio independiente y el registro MX enruta el correo hacia mail.grupo2.os. Resuelta la capa de red y nombres, cedo la palabra a mi compañero, quien demostrará la capa web y el proxy inverso con terminación SSL."
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
  [El cliente no toma IP al conectarse.],
  [Cable PoE invertido.],
  [Verificar que el cable del inyector en puerto *PoE* vaya al AP, y *LAN* vaya al switch.],
  
  [El cliente recibe IP en otro segmento (`10.0.0.x`).],
  [Rango DHCP desconfigurado en OPNsense.],
  [Ir a *Services $arrow.r$ DHCPv4 $arrow.r$ LAN*, asegurar rango `.200-.250`, dar *Save* y *Apply Changes*. Reconectar el Wi-Fi del cliente.],
  
  [`nslookup` devuelve `Time out` o error.],
  [CT 101 detenido o BIND9 caído.],
  [Pedir a Marvin ejecutar en Proxmox: `pct exec 101 -- systemctl restart named`.],
  
  [El Live Log de OPNsense no muestra registros.],
  [Filtro de búsqueda activo.],
  [Borrar el texto del cuadro de búsqueda en Live View y refrescar la página.]
)
