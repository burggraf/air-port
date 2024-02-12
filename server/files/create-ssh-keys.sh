#!/bin/sh
# ./create-ssh-keys.sh <username> <port> <keys>
sudo docker exec -it ssh-server sh -c "/create-user.sh $1 $2"
sudo mkdir -p /home/ubuntu/data/$2/.ssh
#sudo chmod 777 /home/ubuntu/data/$2/.ssh
sudo touch /home/ubuntu/data/$2/.ssh/authorized_keys
sudo chmod 777 /home/ubuntu/data/$2/.ssh/authorized_keys
sudo echo "$3" > /home/ubuntu/data/$2/.ssh/authorized_keys 

