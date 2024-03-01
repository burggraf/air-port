#!/bin/sh
killall marmot
if [ -f /pb/marmot.active ]; then
    rm /pb/marmot.active
    echo "Marmot stopped `date`" >> /pb/log.txt
fi

