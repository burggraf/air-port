#!/bin/bash
# Replacing [HOST] with the result of `echo $HOSTNAME` in start.sh
sed -i "s/\[HOST\]/$(echo $HOSTNAME)/g" /home/ubuntu/start.sh
