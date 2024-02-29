#!/bin/sh
killall marmot
if [ -f /pb/marmot.cbor ]; then
    rm /pb/marmot.cbor
fi
# /marmot -config /pb/marmot.toml -cleanup
/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &
touch /pb/marmot.active
echo "Marmot started `date`" >> /pb/log.txt
echo "Marmot started `date`"

