# $1 machine_id
# $1 version, i.e. 0.21.3
fly machines update -y -i registry.fly.io/air-port-dev:$2 $1

