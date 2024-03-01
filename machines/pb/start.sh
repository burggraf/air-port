#!/bin/sh
/pocketbase serve \
    --http 0.0.0.0:8080 \
    --dir /pb/pb_data \
    --hooksDir /pb/pb_hooks \
    --migrationsDir /pb/pb_migrations \
    --publicDir /pb/pb_public \
    >> /pb/log.txt 2>&1 &

#if [ ! -f /pb/marmot.toml ]; then
    sed "s/\[NODE_ID\]/`printf \"%d\n\" \"0x$FLY_MACHINE_ID\"`/g" /marmot.toml.sample > /marmot1.toml
    sed "s/\[APP_NAME\]/$FLY_APP_NAME/g" /marmot1.toml > /marmot.toml
    cp /marmot.toml /pb/marmot.toml
#fi
if [ -f /pb/marmot.active ]; then
    /marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &
fi
echo "" >> /pb/log.txt
if [ ! -f /pb/.ssh/ssh_host_rsa_key ]; then
    echo "Generating SSH keys" >> /pb/log.txt
    ssh-keygen -A
    mkdir -p /pb/.ssh
    cp /etc/ssh/* /pb/.ssh
    echo "Adding SSH keys to authorized_keys" >> /pb/log.txt
    cat /pb/.ssh/ssh_host_rsa_key.pub >> /pb/.ssh/authorized_keys
fi
if [ -f /pb/litestream.yml ]; then
    echo "Starting litestream" >> /pb/log.txt
    litestream replicate -config /pb/litestream.yml > /dev/null &
fi

/usr/sbin/sshd -f /pb/.ssh/sshd_config

mkdir -p /pb/pb_data
mkdir -p /pb/pb_hooks
mkdir -p /pb/pb_migrations
mkdir -p /pb/pb_public

wait -n
exit $?
