#!/bin/bash

CONTAINER_NAME="ssh-server"

# Check if the container exists
if sudo /usr/bin/docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "Container ${CONTAINER_NAME} exists."

    # Check if the container is not running
    if ! sudo /usr/bin/docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
        echo "Starting existing container ${CONTAINER_NAME}."
        sudo /usr/bin/docker start "${CONTAINER_NAME}"
    else
        echo "Container ${CONTAINER_NAME} is already running."
    fi
else
    echo "Container ${CONTAINER_NAME} does not exist. Running a new container."
    sudo /usr/bin/docker run --restart=unless-stopped --detach -p 2222:22 -v /home/ubuntu/data:/data --name "${CONTAINER_NAME}" ssh-server
fi
