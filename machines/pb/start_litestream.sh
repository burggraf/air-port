#!/bin/sh
killall litestream
if [ -f /pb/litestream.yml ]; then
    litestream replicate -config /pb/litestream.yml > /dev/null &
    echo "Litestream started `date`" >> /pb/log.txt
fi

