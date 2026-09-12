#!/usr/bin/env bash
set -e

echo "==> [1/2] Actualizando catálogo oficial de plantillas Proxmox..."
pveam update

echo "==> [2/2] Descargando plantilla oficial de Debian 12 Bookworm..."
TMPL=$(pveam available --section system | grep 'debian-12-standard' | head -n 1 | awk '{print $2}')
echo "Plantilla seleccionada: $TMPL"
pveam download local "$TMPL"

echo ""
echo "Plantilla descargada exitosamente en el almacenamiento local:"
ls -lh /var/lib/vz/template/cache/
