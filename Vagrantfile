# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Deshabilitar el plugin vagrant-vbguest para evitar conflictos de kernel headers
  if Vagrant.has_plugin?("vagrant-vbguest")
    config.vbguest.auto_update = false
    config.vbguest.no_install = true
  end

  # Base oficial Debian 12 (Bookworm 64-bit)
  config.vm.box = "debian/bookworm64"
  config.vm.hostname = "pve.grupo.os"

  # Mantener viva la conexion SSH para evitar que se congele por inactividad
  config.ssh.keep_alive = true

  # Red privada con IP estática (Host-Only)
  config.vm.network "private_network", ip: "192.168.56.100"

  # Reenvío de puertos para Web GUI de Proxmox
  config.vm.network "forwarded_port", guest: 8006, host: 8006, auto_correct: true

  # ==========================================
  # Configuración del Hipervisor (VirtualBox)
  # ==========================================
  config.vm.provider "virtualbox" do |vb|
    vb.name = "SO1-Proyecto1-Proxmox"
    vb.memory = 8192       # 8 GB de RAM asignados
    vb.cpus = 4            # 4 vCPUs
    
    # Habilitar Virtualización Anidada (Nested Virtualization)
    vb.customize ["modifyvm", :id, "--nested-hw-virt", "on"]
    vb.customize ["modifyvm", :id, "--nicpromisc2", "allow-all"]
    vb.customize ["modifyvm", :id, "--nat-localhostreachable1", "on"]
  end

  # ==========================================
  # Configuración para VMware (Alternativa)
  # ==========================================
  config.vm.provider "vmware_desktop" do |v|
    v.vmx["numvcpus"] = "4"
    v.vmx["memsize"] = "8192"
    v.vmx["vhv.enable"] = "TRUE" # Virtualización Anidada
  end

  # ==========================================
  # Aprovisionamiento Automatizado Proxmox VE 8
  # ==========================================
  config.vm.provision "shell", inline: <<-SHELL
    set -euo pipefail
    export DEBIAN_FRONTEND=noninteractive

    echo "==> [1/6] Configurando resolución local /etc/hosts..."
    if ! grep -q "192.168.56.100" /etc/hosts; then
      echo "192.168.56.100 pve.grupo.os pve" >> /etc/hosts
    fi

    echo "==> [2/6] Configurando repositorios oficiales Proxmox VE 8 (No-Subscription)..."
    wget -qO /etc/apt/trusted.gpg.d/proxmox-release-bookworm.gpg http://download.proxmox.com/debian/proxmox-release-bookworm.gpg
    echo "deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription" > /etc/apt/sources.list.d/pve-install-repo.list
    rm -f /etc/apt/sources.list.d/pve-enterprise.list

    echo "==> [3/6] Actualizando lista de paquetes e índices del sistema..."
    apt-get update -y
    apt-get full-upgrade -y

    echo "==> [4/6] Instalando Proxmox VE 8 y dependencias de red..."
    # Configurar postfix por defecto como local
    debconf-set-selections <<EOF
postfix postfix/main_mailer_type select Local only
postfix postfix/mailname string pve.grupo.os
EOF

    apt-get install -y proxmox-ve postfix open-iscsi chrony ifupdown2
    apt-get remove -y os-prober || true

    echo "==> [5/6] Configurando credenciales de acceso para usuario root..."
    echo "root:proxmox" | chpasswd

    echo "==> [6/6] Ajustando advertencia de suscripción en PVE Web..."
    sed -Ezi.bak "s/(Ext.Msg.show\(\{\s+title: gettext\('No valid sub)/void\(\{ \/\/\1/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js || true
    systemctl restart pveproxy.service || true

    echo "===================================================================="
    echo "   Proxmox VE 8 desplegado y configurado exitosamente!"
    echo "   URL Web GUI: https://localhost:8006  o  https://192.168.56.100:8006"
    echo "   Usuario: root"
    echo "   Contraseña: proxmox"
    echo "===================================================================="
  SHELL
end
