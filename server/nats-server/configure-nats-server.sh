#!/bin/bash

# File paths
HOSTNAME_FILE="/etc/hostname"
CONFIG_FILE="/home/ubuntu/nats-server/nats-server.conf" # Replace with the path to your actual config file
BACKUP_FILE="${CONFIG_FILE}.backup"

# Backup the original configuration file
cp "$CONFIG_FILE" "$BACKUP_FILE"

# Read hostname from the file
HOSTNAME=$(cat "$HOSTNAME_FILE")

# Check if the HOSTNAME file is not empty
if [ -z "$HOSTNAME" ]; then
    echo "Hostname is empty. Exiting."
    exit 1
fi

# Replace <HOSTNAME> with the actual hostname in the configuration file
sed -i "s/<HOSTNAME>/$HOSTNAME/g" "$CONFIG_FILE"

# Check for errors
if [ $? -eq 0 ]; then
    echo "Hostname has been successfully updated in the configuration file."
else
    echo "An error occurred during the update."
fi
