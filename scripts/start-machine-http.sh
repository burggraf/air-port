# $1 domain
# $2 machine_id
curl -H "fly-force-instance-id: $2" https://$1.fly.dev/api/health
