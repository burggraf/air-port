#!/bin/bash

# Define the server name
SERVER_NAME=`cat /etc/hostname`

# Define the file where the results will be stored
RESULTS_FILE="sysbench_results.txt"

# Define the total size of files to be used for the test
FILE_TOTAL_SIZE="1G"

# Define the number of threads to use for the test
THREADS="4"

# Define the number of files to be used for the test
FILE_NUM="10"

# Prepare and run the CPU test
sysbench cpu --cpu-max-prime=20000 --threads=$THREADS run > cpu_results.txt

# Extract the CPU speed result
CPU_SPEED=$(grep "events per second:" cpu_results.txt | awk '{print $4}')

# Prepare and run the file I/O test
sysbench fileio --file-total-size=$FILE_TOTAL_SIZE --file-test-mode=rndrw --threads=$THREADS --file-num=$FILE_NUM prepare
sysbench fileio --file-total-size=$FILE_TOTAL_SIZE --file-test-mode=rndrw --threads=$THREADS --file-num=$FILE_NUM run > fileio_results.txt

# Extract the read and write disk speed results
READ_SPEED=$(grep "read, MiB/s:" fileio_results.txt | awk '{print $3}')
WRITE_SPEED=$(grep "written, MiB/s:" fileio_results.txt | awk '{print $3}')

# Clean up the temporary files created by the file I/O test
sysbench fileio --file-total-size=$FILE_TOTAL_SIZE --file-test-mode=rndrw --threads=$THREADS --file-num=$FILE_NUM cleanup

# Write the results to the results file
echo "$SERVER_NAME, CPU: $CPU_SPEED, Read: $READ_SPEED MiB/s, Write: $WRITE_SPEED MiB/s" >> $RESULTS_FILE

# Remove the temporary results files
rm cpu_results.txt fileio_results.txt
