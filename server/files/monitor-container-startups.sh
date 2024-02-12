#!/bin/bash

LOGFILE="container_start_log.txt"

docker events --filter 'event=start' --format '{{json .}}' |
while read event
do
    container_name=$(echo $event | grep -o '"name":"[^"]*' | grep -o '[^"]*$')
    
    # Skip if the container name is 'ssh-server'
    if [ "$container_name" == "ssh-server" ]; then
        continue
    fi

    sudo /home/ubuntu/stats.sh $container_name start
done
