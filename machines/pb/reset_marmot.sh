#!/bin/sh
killall marmot
rm /pb/marmot.cbor
/marmot -config /pb/marmot.toml >> /pb/marmot.txt 2>&1 &
