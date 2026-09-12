# Capa NoSQL Redis 7 (Base de Datos Híbrida)

## Justificación y Configuración

Para satisfacer los requerimientos de innovación y puntos extra de **Base de Datos Híbrida (SQL + NoSQL)**:

* **Servidor NoSQL:** Redis 7 (In-Memory Key-Value Data Store).
* **Ubicación:** CT 103 (`192.168.56.103:6379`).
* **Optimización de Recursos:** Se reubicó Redis en CT 103 para evitar saturación de memoria RAM en el contenedor CT 105 (dedicado a MariaDB).

### Funcionalidades Implementadas

1. **Gestión de Sesiones de Better Auth:** Almacenamiento volátil y validación ultra-rápida de tokens JWT / sessions en memoria.
2. **Caché de Catálogos Paramétricos:** Reducción de latencia en consultas repetitivas de diagnósticos CIE-10 y listas médicas.
3. **Aislamiento de Red:** Escucha protegida y restringida mediante `iptables` en CT 103 permitiendo acceso únicamente desde CT 102 (`192.168.56.102`).
