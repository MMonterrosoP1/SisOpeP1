# Sistema de Gestión Clínica y Expedientes Médicos Seguros — Grupo 2

> **Universidad Mariano Gálvez de Guatemala (UMG)**  
> **Facultad de Ingeniería en Sistemas de Información y Ciencias de la Computación**  
> **Curso:** Sistemas Operativos I (Sección B)  
> **Proyecto Final:** Ecosistema de Servicios Auditado y Seguro  
> **Dominio Autoritativo:** `grupo2.os`

---

## Arquitectura de Infraestructura en Sistemas Operativos (Proxmox VE 8)

El ecosistema opera sobre virtualización a nivel de sistema operativo utilizando **5 Contenedores Linux (LXC)** sobre el hipervisor **Proxmox VE 8** (Debian 12), interconectados mediante el switch virtual `vmbr0` en la subred privada `192.168.56.0/24`:

| Contenedor | IP Estática | Hostname / Dominio | Servicios y Puertos | Rol / Responsable |
| :---: | :---: | :--- | :--- | :--- |
| **CT 101** | `192.168.56.101` | `ns1.grupo2.os` | **BIND9 DNS** (:53) + Forwarders | Líder de Red & DNS (Wilson) |
| **CT 102** | `192.168.56.102` | `app.grupo2.os` | **Next.js Fullstack** (:3000) bajo PM2 Daemon | Desarrollador Fullstack (Aaron) |
| **CT 103** | `192.168.56.103` | `clinica.grupo2.os` | **Nginx HTTPS** (:443) + **Redis 7 NoSQL** (:6379) | Ingeniero Web & SSL (Reyli) |
| **CT 104** | `192.168.56.104` | `mail.grupo2.os`<br>`sftp.grupo2.os` | **Postfix SMTP** (:25) + **Dovecot IMAP** (:143) + **SFTP Chroot** (:22) | Especialista en Servicios (Andrés) |
| **CT 105** | `192.168.56.105` | `db.grupo2.os` | **MariaDB SQL** (:3306 Aislado) | Administrador de BD (Marvin) |
| **Host PVE**| `192.168.56.100` | `pve.local` | Vagrant, iptables (Egress WAN & DB Isolation) | DevSecOps & Líder (Marvin) |

### Puntos Extra e Innovaciones Implementadas:
1. **Subdominios por Protocolo en `.os`:** `clinica.grupo2.os` (Web), `mail.grupo2.os` (MX SMTP), `sftp.grupo2.os` (Archivos), `db.grupo2.os` (SQL).
2. **Base de Datos Híbrida (SQL + NoSQL):** MariaDB en CT 105 para consistencia ACID relacional + Redis 7 en CT 103 para sesiones volátiles y caché.
3. **Aislamiento Estricto de Base de Datos:** Puertos 3306 y 6379 bloqueados con `iptables` con acceso concedido exclusivamente a CT 102.
4. **Restricción WAN (Egress Filtering):** Bloqueo total de salida a Internet en CT 105, CT 104 y CT 102 para evitar fuga de información.
5. **Servidor DHCP Local:** OPNsense gestionando direccionamiento `.200-.250` y entregando DNS local `192.168.56.101`.
6. **Almacenamiento Seguro SFTP Chroot Jail:** Bandera `-R` forzada para cuenta `paciente_sftp` (solo lectura) y permisos de escritura para `backend_sftp`.

---

## Aplicación Web de Gestión Clínica (Next.js)

Sistema integral de gestión clínica y expedientes médicos electrónicos, diseñado para la administración eficiente de pacientes, historial clínico, consultas médicas y emisión de constancias certificadas.

## Tecnologías Principales

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Cache Components)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Librería UI**: [React 19](https://react.dev/) + [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Base UI](https://base-ui.com/) / Componentes personalizados accesibles
- **ORM**: [Prisma](https://www.prisma.io/) (con MariaDB / MySQL)
- **Autenticación**: [Better Auth](https://www.better-auth.com/) con control de acceso basado en roles (RBAC)
- **Documentos PDF**: [@react-pdf/renderer](https://react-pdf.org/) y jsPDF
- **Validación**: [Zod](https://zod.dev/)
- **Testing**: [Vitest](https://vitest.dev/) con cobertura V8
- **Gestor de paquetes**: [pnpm](https://pnpm.io/)

---

## Módulos del Sistema

1. **Expediente de Pacientes**:
   - Registro y edición de datos demográficos con validación de documentos de identidad (DPI/Cédula).
   - Historial médico completo: alergias, antecedentes patológicos/no patológicos, quirúrgicos, traumáticos, familiares, hábitos y actividad física.
   - Búsqueda interactiva y asociación de diagnósticos con catálogo internacional **CIE-10**.

2. **Consultas Médicas (Encounters)**:
   - Registro de motivos de consulta, signos vitales, antropometría (cálculo automático de IMC), examen físico y diagnósticos.
   - Evaluación de aptitud médica y prescripción de tratamientos.
   - Emisión y descarga en tiempo real de **Constancias Médicas** y **Constancias de Enfermedad** en formato PDF.

3. **Catálogos Paramétricos**:
   - Gestión y alta rápida de catálogos médicos (empresas, lugares de trabajo, áreas, parentescos, tipos de sangre, alergias, hábitos, etc.).
   - Normalización y detección preventiva de duplicados.

4. **Auditoría y Seguridad**:
   - Registro de auditoría para trazabilidad de creación y modificación de registros clínicos.
   - Protección de rutas y endpoints mediante autenticación segura y roles (`ADMIN`, `DOCTOR`).

---

## Estrategia y Suite de Pruebas (Testing)

El proyecto cuenta con una infraestructura de pruebas automatizadas construida sobre **[Vitest](https://vitest.dev/)**, garantizando validación estricta de datos y prevención de regresiones en flujos críticos.

### 1. Niveles y Tipos de Pruebas

- **Validación y Esquemas (`*.schemas.test.ts`, `zod-helpers.test.ts`)**:
  - Verificación de tipos, rangos numéricos, fechas, formatos de DPI y mensajes de error descriptivos.
  - Asegura que los datos de entrada a Server Actions y mutaciones cumplan con las reglas de negocio antes de tocar la base de datos.

- **Lógica de Negocio y Dominio (`*.service.test.ts`, `bmi-calculator.test.ts`, `vital-sign-ranges.ts`)**:
  - Pruebas aisladas para el cálculo de IMC, clasificación nutricional y validación de signos vitales.
  - Aislamiento de capas mediante mocks de repositorios y librerías externas.

- **Seguridad y Autorización (`auth-guard.test.ts`, `audit.*.test.ts`)**:
  - Validación de control de acceso por roles (`ADMIN`, `DOCTOR`, etc.).
  - Registro de pistas de auditoría en operaciones sensibles.

- **Capa de Persistencia y Consultas (`*.repository.test.ts`, `*.queries.test.ts`)**:
  - Validación de mapeo de entidades, relaciones anidadas, filtros combinados y paginación.

- **Rutas API y Server Actions (`*.actions.test.ts`, `route.test.ts`)**:
  - Respuestas HTTP, códigos de estado y serialización en endpoints de búsqueda y autenticación.

- **Flujos Críticos e Integración E2E (`critical-api.e2e.test.ts`, `encounter-document.integration.test.ts`)**:
  - Integración del ciclo completo: registro de consulta -> generación de constancia PDF -> entrega a través del endpoint de documentos.

### 2. Comandos para Ejecutar Pruebas

```bash
# Ejecutar toda la suite de pruebas unitarias e integración
pnpm test

# Modo interactivo (Watch Mode) para desarrollo con recarga en caliente
pnpm test:watch

# Generar reporte de cobertura de código (V8 Coverage)
pnpm test:coverage

# Ejecutar pruebas críticas de flujos API / E2E
pnpm test:e2e:critical

# Ejecutar pruebas críticas para entornos de CI/CD
pnpm test:e2e:critical:ci
```

---


### 3. Migraciones y Carga de Datos Iniciales (Seed)

```bash
# Generar cliente de Prisma
pnpm prisma generate

# Ejecutar migraciones en base de datos
pnpm prisma migrate dev

# Cargar catálogos base, CIE-10 y usuario administrador
pnpm prisma db seed
```

