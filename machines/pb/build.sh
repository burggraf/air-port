#!/bin/bash

# Check if a command-line argument was passed to the script
if [ "$#" -lt 2 ]; then
  echo "Usage: ./build.sh <version> <tag>"
  echo "Example: ./build.sh 0.21.1 latest"
  echo "Example: ./build.sh 0.21.0 0.21.0"
  exit 1
fi

# Rest of the script goes here

#docker build --build-arg PB_VERSION=$1 --build-arg TAG=$2 -t baeldung_greetings .
docker build \
    --build-arg PB_VERSION=$1 \
    --platform linux/amd64 \
    -t registry.fly.io/air-port-dev:$2 .
docker push registry.fly.io/air-port-dev:$2
#flyctl launch --build-only
#flyctl volumes create pb_data --size=1
#flyctl deploy
