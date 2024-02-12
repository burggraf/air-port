#!/bin/sh

# Check if username is provided
if [ "$#" -ne 1 ]; then
    echo "Usage: ./delete-user.sh <username>"
    exit 1
fi

USERNAME=$1
SSHD_CONFIG_FILE="/etc/ssh/sshd_config"

# Create a backup of the original sshd_config file
cp $SSHD_CONFIG_FILE "${SSHD_CONFIG_FILE}.bak"

# Use sed to delete the matched line and the one following it
sed -i "/Match User $USERNAME\$/,+1 d" $SSHD_CONFIG_FILE

# Delete the user account
deluser $USERNAME

# Find the PID of sshd
SSHD_PID=$(pidof /usr/sbin/sshd)

# Check if SSHD is running
if [ -n "$SSHD_PID" ]; then
    # Send SIGHUP to SSHD to gracefully reload it
    kill -HUP $SSHD_PID
else
    # Start SSHD if it's not running
    /usr/sbin/sshd -D -e
fi
