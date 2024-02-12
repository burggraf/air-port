#!/bin/bash

# Set the path for the key
KEY_PATH="$HOME/.ssh/id_rsa"

# Check if the key already exists
if [ -f "$KEY_PATH" ]; then
    echo "SSH key already exists at $KEY_PATH. No new key generated."
else
    # Generate a new SSH key
    ssh-keygen -q -t rsa -b 2048 -N "" -f "$KEY_PATH"
    echo "SSH key generated at $KEY_PATH."
fi

