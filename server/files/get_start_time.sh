sudo docker inspect --format='{{ .State.StartedAt }}' $1 | xargs -I {} date -d {} +%s
