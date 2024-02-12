#!/bin/bash

# URL to be fetched
url="$1"

# Curl command to fetch the page and record the time in milliseconds
time_taken=$(curl -o /dev/null -s -w '%{time_total}\n' $url)

# Converting time to milliseconds
time_in_ms=$(echo "$time_taken * 1000" | bc)

# Output the time in milliseconds
echo "Time taken to fetch the page $1: $time_in_ms ms"
