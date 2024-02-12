cd /home/ubuntu
sudo docker stop -t 0 nats-server
sudo docker rm nats-server
./start-nats-server.sh


