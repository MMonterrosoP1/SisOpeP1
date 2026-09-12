# Servidor DHCP Local (OPNsense / CT 101)

## Configuración del Servidor DHCP

Para cumplir con la rúbrica de asignación dinámica de direccionamiento en la red local y entrega de DNS autoritativo:

* **Servicio:** DHCPv4 Server (OPNsense en `192.168.56.1` / respaldo `isc-dhcp-server` en CT 101).
* **Interfaz:** `LAN` (`192.168.56.1/24`).
* **Rango Dinámico:** `192.168.56.200` a `192.168.56.250`.
* **Máscara de Subred:** `255.255.255.0` (`/24`).
* **Puerta de Enlace (Gateway):** `192.168.56.1`.
* **Servidor DNS Primario:** `192.168.56.101` (CT 101 - BIND9 `grupo2.os`).
* **Tiempo de Arrendamiento (Lease Time):** 7200 segundos (2 horas).
