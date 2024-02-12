#!/bin/bash

# List of download links
links=(
    "https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.21.0/pocketbase_0.21.0_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.7/pocketbase_0.20.7_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.6/pocketbase_0.20.6_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.5/pocketbase_0.20.5_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.4/pocketbase_0.20.4_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.3/pocketbase_0.20.3_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.2/pocketbase_0.20.2_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.1/pocketbase_0.20.1_linux_amd64.zip"
    "https://github.com/pocketbase/pocketbase/releases/download/v0.20.0/pocketbase_0.20.0_linux_amd64.zip"
)

# Iterate over each link
for link in "${links[@]}"; do
    # Download the file
    wget "$link"

    # Extract the specific part of the URL after '/download/'
    directory=$(echo "$link" | sed -E 's|.*/download/([^/]+)/.*|\1|')

    # Create a directory with the extracted name
    mkdir -p "$directory"

    # Get the filename from the link
    filename=$(basename "$link")

    # Check if the file is a zip file and unzip it to the created directory
    if [[ $filename == *.zip ]]; then
        unzip -o "$filename" -d "$directory"
    # Check if the file is a gz file and extract it to the created directory
    elif [[ $filename == *.gz ]]; then
        tar -xzf "$filename" -C "$directory"
    fi

    # Delete the downloaded file
    rm -f "$filename"
done
