#!/bin/sh
# ./delete-ssh-keys.sh <username> <port>
sudo docker exec -it ssh-server sh -c "/delete-user.sh $1"
sudo rm -r /home/ubuntu/data/$2/.ssh

