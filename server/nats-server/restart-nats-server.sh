#!/bin/sh

# Find the PID of nats-server
PID=$(pidof nats-server)

# Check if nats-server is running
if [ -n "$PID" ]; then
    # Send SIGHUP to nats-server to gracefully reload it
    kill -HUP $PID
else
    # Start nats-server if it's not running
    nats-server -c /nats-server/nats-server.conf --jetstream
fi

