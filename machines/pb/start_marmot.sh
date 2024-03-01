#!/bin/sh
killall marmot
/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &
touch /pb/marmot.active
echo "Marmot started `date`" >> /pb/log.txt

