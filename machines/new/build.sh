fly apps create $1 --org air-port-dev
fly volumes create pb_data --size=1 --app $1 --region $2 -y
fly deploy --app $1 --config ./fly.toml --image registry.fly.io/air-port-dev:latest --region $2 --now
