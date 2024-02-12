docker run \
--detach \
--rm \
--name $1 \
--cpus=0.25 \
--memory=256M \
-p $1:8090 \
-v $(pwd)/data/$1/pb_data:/home/pocketbase/pb_data \
-v $(pwd)/data/$1/pb_public:/home/pocketbase/pb_public \
-v $(pwd)/data/$1/pb_migrations:/home/pocketbase/pb_migrations \
-v $(pwd)/data/$1/pb_hooks:/home/pocketbase/pb_hooks \
pbdocker > /dev/null
sleep 1
echo 'OK'