sudo systemctl stop stats-file-server.service
cp target/release/stats-file-server ~/stats-file-server.exe
sudo systemctl start stats-file-server.service

