# $1 machine_id
# $1 version, i.e. 0.22.0
fly machines update -y -i registry.fly.io/air-port-dev:$2 $1

