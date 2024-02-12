#!/bin/bash
# echo "*** Checking for Inactive Docker Containers ***"

# Define the threshold for inactivity in seconds (5 minutes here)
INACTIVITY_THRESHOLD=300

# List all running containers
containers=$(sudo docker ps --format '{{.Names}}')

# Check each container for inactivity
for container in $containers; do

    file_path="/home/ubuntu/data/$container/pb_data/logs.db-wal"

    if [ ! -f "$file_path" ]; then
       file_path="/home/ubuntu/data/$container/pb_data/logs.db"
    fi

    if [ -f "$file_path" ]; then
        # Calculate the age of the file
        file_age=$(( $(date +%s) - $(stat -c %Y "$file_path") ))

        # Test if the file is older than the inactivity threshold
        if [ $file_age -gt $INACTIVITY_THRESHOLD ]; then
            # echo "The file for container $container is older than $INACTIVITY_THRESHOLD seconds. ($file_age)"
            /home/ubuntu/stats.sh $container stop
            sudo docker stop -t 0 $container
            echo "Stopped container $container ($file_age seconds inactive) `date`" >> /home/ubuntu/stop_inactive_containers.log
        # else
            # echo "The file for container $container is not older than $INACTIVITY_THRESHOLD seconds. ($file_age)"
        fi
    fi
done
