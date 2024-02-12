#!/bin/bash
# stats.sh <container_name> <event_name>
# i.e. stats.sh container123 start
#
# log format:
# timestamp,   event, container_name,   cpu (% of allowed),    mem, mem max,  net/i,  net/o, block/i, block/o
# 1702512402	start	       10004  0.96%	               10.76MiB	  256MiB  5.78kB  12.6kB	  0B   69.6kB
FILE="/home/ubuntu/stats/$(date -u '+%s').txt"

sudo docker stats \
	--no-stream \
	--format "$(date -u '+%s')\t$2\t{{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}" \
	$1 \
	| sed 's| / |\t|g' \
	| grep -v 'nats-server' \
	| grep -v 'ssh-server' > $FILE

# Check if file size is greater than 0
if [ -s $FILE ]; then
    # Change file permissions to read and write for everyone
    chmod 666 $FILE
else
    # Delete the file if it's empty (0 bytes)
    rm $FILE
fi
