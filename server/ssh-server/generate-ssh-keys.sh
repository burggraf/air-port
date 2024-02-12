#!/bin/sh

# Define the path where the keys will be stored
SSH_KEY_DIR="/etc/ssh"

# Function to generate a key of a specific type
generate_key() {
    key_type=$1
    key_file="$SSH_KEY_DIR/ssh_host_${key_type}_key"

    # Check if the key already exists
    if [ ! -f "$key_file" ]; then
        echo "Generating $key_type key..."
        ssh-keygen -t "$key_type" -f "$key_file" -N ""
    else
        echo "$key_type key already exists."
    fi
}

# Generate each type of key
generate_key rsa
generate_key dsa
generate_key ecdsa
generate_key ed25519

echo "SSH host key generation complete."

