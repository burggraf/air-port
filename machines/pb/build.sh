docker build --platform linux/amd64 -t registry.fly.io/air-port-pb:latest .
docker push registry.fly.io/air-port-pb:latest
#flyctl launch --build-only
#flyctl volumes create pb_data --size=1
#flyctl deploy
