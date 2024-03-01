#!/bin/sh
killall litestream
if [ -f /pb/litestream.yml ]; then
    rm /pb/litestream.yml
    echo "Litestream stopped `date`" >> /pb/log.txt
fi


