#!/bin/sh

# Get the PID of the HAProxy master process
# The master process typically has a PPID of 1
PID=$(ps -eo pid,ppid,comm | grep haproxy | awk '$2 == 1 {print $1}')

# Check if the HAProxy master process is running
if [ -n "$PID" ]; then
    # Send SIGHUP to the HAProxy master process to gracefully reload it
    sudo kill -HUP $PID
else
    echo "HAProxy master process not found."
fi
