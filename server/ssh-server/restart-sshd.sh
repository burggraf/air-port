#!/bin/sh

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

