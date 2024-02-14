#!/bin/sh
#if [ ! -f /jetstream/nats-server.conf ]; then
    sed "s/\[HOSTNAME\]/$FLY_REGION-$FLY_APP_NAME/g" /nats-server.conf.sample > /jetstream/nats-server.conf.1
    sed "s/\[REGION\]/$FLY_REGION/g" /jetstream/nats-server.conf.1 > /jetstream/nats-server.conf
#fi
if [ -f /jetstream/nats-server.conf ]; then
    # /nats-server -c /jetstream/nats-server.conf >> /jetstream/log.txt 2>&1 &
    /nats-server -c /jetstream/nats-server.conf
fi
# sleep 999999
wait -n
exit $?
