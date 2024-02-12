#!/bin/bash

# Start containers with dynamic port allocation
start_container() {
    port=$((10000 + $1))
    docker-compose up -d --scale server=1 --build --force-recreate
    docker-compose port server 8090 | cut -d ":" -f 2
}

# Release container and port
release_container() {
    container_id=$(docker ps -q --filter "name=myapp_server_$1")
    echo container_id is $container_id
    docker stop $container_id
    docker rm $container_id
}

# Example usage
action="$1"
container_number="$2"

case $action in
    start)
        start_container $container_number
        ;;
    release)
        release_container $container_number
        ;;
    *)
        echo "Usage: $0 {start|release} <container_number>"
        exit 1
        ;;
esac
