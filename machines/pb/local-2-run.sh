docker stop -t 0 air-port-pb
docker rm air-port-pb
docker run --name air-port-pb -d -p 2222:2222 air-port-pb

