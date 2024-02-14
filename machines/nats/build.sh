flyctl launch -o air-port-dev --build-only
flyctl volumes create jetstream --size=1
flyctl deploy
