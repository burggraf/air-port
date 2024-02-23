#!/bin/sh
/pocketbase serve \
    --http 0.0.0.0:8080 \
    --dir /pb/pb_data \
    --hooksDir /pb/pb_hooks \
    --migrationsDir /pb/pb_migrations \
    --publicDir /pb/pb_public \
    >> /pb/log.txt 2>&1 &

if [ ! -f /pb/marmot.toml ]; then
    sed "s/\[NODE_ID\]/`printf \"%d\n\" \"0x$FLY_MACHINE_ID\"`/g" /marmot.toml.sample > /marmot1.toml
    sed "s/\[APP_NAME\]/$FLY_APP_NAME/g" /marmot1.toml > /marmot.toml
    cp /marmot.toml /pb/marmot.toml
fi
if [ -f /pb/marmot.active ]; then
    /marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &
fi
if [ ! -f /pb/.ssh/ssh_host_rsa_key ]; then
    ssh-keygen -A
    mkdir -p /pb/.ssh
    cp /etc/ssh/* /pb/.ssh
    cat /pb/.ssh/ssh_host_rsa_key.pub >> /pb/.ssh/authorized_keys
fi

/usr/sbin/sshd -f /pb/.ssh/sshd_config

mkdir -p /pb/pb_data
mkdir -p /pb/pb_hooks
mkdir -p /pb/pb_migrations
mkdir -p /pb/pb_public

# /server & # runs on port 2222

# /usr/sbin/sshd 
wait -n
exit $?
# ssh -p 2222 -i /pb/.ssh/id_rsa root@<ipv6>
# /usr/bin/rsync -avz6 -e "ssh -p 2222 -i /pb/.ssh/id_rsa" /pb/pb_public/ root@[<ipv6>]:/pb/pb_public/
# dig TXT top3.nearest.of.air-port-dev.internal +short
# returns
# "ip=fdaa:2:80a6:a7b:167:a64e:c4a4:2,region=sjc,ping=0;ip=fdaa:2:80a6:a7b:251:820c:c983:2,region=ams,ping=135"
