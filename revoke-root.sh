#!/bin/bash

# Ensure the script is run as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root" 
   exit 1
fi

# Check for the existence of the SSH key
if [ ! -f "/root/.ssh/id_rsa" ]; then
    echo "No SSH key found in /root/.ssh/id_rsa. Please setup SSH key first."
    exit 1
fi
# Check for the existence of the SSH key
if [ ! -f "/root/.ssh/authorized_keys" ]; then
    echo "No SSH key found in /root/.ssh/authorized_keys. Please setup SSH key first."
    exit 1
fi

# Update SSH configuration to disable password authentication
echo "Disabling password authentication for SSH..."
sed -i '/^PasswordAuthentication[[:space:]]/c\PasswordAuthentication no' /etc/ssh/sshd_config
sed -i '/^PubkeyAuthentication[[:space:]]/c\PubkeyAuthentication yes' /etc/ssh/sshd_config

# Restart SSH to apply changes
systemctl restart sshd
echo "SSH configuration updated."

# Creating a new user 'ubuntu'
echo "Creating a new user 'ubuntu'..."
adduser ubuntu --disabled-password
usermod -aG sudo ubuntu

# Copy SSH keys from root to new user
echo "Copying SSH keys to 'ubuntu' user..."
rsync --archive --chown=ubuntu:ubuntu /root/.ssh /home/ubuntu

echo "Removing password for 'ubuntu' user..."
sudo passwd -d ubuntu

# Disable root login
echo "Disabling root login..."
sed -i '/^PermitRootLogin[[:space:]]/c\PermitRootLogin no' /etc/ssh/sshd_config

# Restart SSH to apply changes
systemctl restart sshd
echo "Root login disabled."

echo "Setup completed. Test login with 'ubuntu' user before closing this session."

