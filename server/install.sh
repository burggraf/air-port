# check if argument is empty
# check for two arguments
if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "syntax: ./install.sh <host-name> <domain-name>"
    echo "example: ./install.sh west-1.azabab.com azabab.com"
    exit 1
fi

if [ ! -f "./private/cloudflare.ini" ]; then
    echo "cloudflare.ini file not found!"
    echo "Please create a ./private/cloudflare.ini file with the following format:"
    echo "dns_cloudflare_email = user@host.com"
    echo "dns_cloudflare_api_key = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
    exit 1
fi

echo ""
echo "*** Setting hostname ***"
echo ""
ssh ubuntu@$1 "sudo hostnamectl set-hostname $1"

echo ""
echo "*** Install Docker ***"
echo ""

ssh ubuntu@$1 "sudo apt update"
# ssh ubuntu@$1 "sudo apt-get update && sudo apt-get -y upgrade && sudo apt-get -y dist-upgrade && sudo apt-get -y autoremove"
ssh ubuntu@$1 "sudo apt install -y apt-transport-https ca-certificates curl software-properties-common"
# (MAY NEED THIS) sudo apt-get install pkg-config libssl-dev
ssh ubuntu@$1 "sudo apt-get install -y pkg-config libssl-dev"
ssh ubuntu@$1 "sudo apt-get install -y zip unzip"
ssh ubuntu@$1 "sudo apt-get install -y rclone"
ssh ubuntu@$1 "curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -"
ssh ubuntu@$1 "sudo add-apt-repository \"deb [arch=amd64] https://download.docker.com/linux/ubuntu focal stable\""
ssh ubuntu@$1 "apt-cache policy docker-ce"
ssh ubuntu@$1 "sudo apt update"
ssh ubuntu@$1 "sudo apt install -y docker-ce"
ssh ubuntu@$1 "sudo systemctl status docker"

echo ""
echo "*** Install Wildcard SSL Certificate ***"
echo ""
echo "Installing certbot"
ssh ubuntu@$1 "sudo apt install -y certbot python3-certbot-nginx python3-certbot-dns-cloudflare"

echo ""
echo "Request Wildcard SSL Certificate"
echo ""
scp ./private/cloudflare.ini ubuntu@$1:~
ssh ubuntu@$1 "sudo certbot certonly --non-interactive --dns-cloudflare-propagation-seconds 60 --email support@azabab.com --agree-tos --dns-cloudflare --dns-cloudflare-credentials ./cloudflare.ini -d \"*.azabab.com\" -d \"*.$2\""

echo ""
echo "Copy all necessary files to the server"
echo ""
scp -r files/* ubuntu@$1:~/
echo ""
echo "Download the exes"
echo ""
ssh ubuntu@$1 "cd exe;./download_exes.sh"

echo ""
echo "*** Generate rsa key pair (if necessary) ***"
echo ""
ssh ubuntu@$1 "/home/ubuntu/generate_ssh_key.sh"

# echo ""
# echo "Configuring Nginx"
# echo ""
# ssh ubuntu@$1 "sudo mv ~/options-ssl-nginx.conf /etc/letsencrypt"
# ssh ubuntu@$1 "sudo chmod 644 /etc/letsencrypt/options-ssl-nginx.conf"
# ssh ubuntu@$1 "sudo chown root:root /etc/letsencrypt/options-ssl-nginx.conf"
# ssh ubuntu@$1 "sudo touch /etc/nginx/domain_ports.txt"
# ssh ubuntu@$1 "sudo chmod 644 /etc/nginx/domain_ports.txt"
# ssh ubuntu@$1 "sudo chown ubuntu:ubuntu /etc/nginx/domain_ports.txt"

# ssh ubuntu@$1 "sudo touch /etc/nginx/domain_pb_version.txt"
# ssh ubuntu@$1 "sudo chmod 644 /etc/nginx/domain_pb_version.txt"
# ssh ubuntu@$1 "sudo chown ubuntu:ubuntu /etc/nginx/domain_pb_version.txt"

# Escape dots in the domain for the second replacement

# Replace [DOMAIN] with the provided domain
### ssh ubuntu@$1 "sed -i \"s/\[DOMAIN\]/$2/g\" ~/nginx.conf"

# Replace [DOMAIN-WITH-DOTS-ESCAPED] with the escaped domain
#ssh ubuntu@$1 "ESCAPED_DOMAIN=\$(echo $2 | sed 's/\./\\./g');sed -i \"s/\[DOMAIN-WITH-DOTS-ESCAPED\]/$ESCAPED_DOMAIN/g\" ~/nginx.conf"
# Escape dots in the domain for the second replacement
###ESCAPED_DOMAIN=$(echo $2 | sed 's/\./\\\\./g')
#ssh ubuntu@$1 'ESCAPED_DOMAIN=$(echo '"$2"' | sed "s/\./\\\./g"); sed -i "s/\[DOMAIN-WITH-DOTS-ESCAPED\]/$ESCAPED_DOMAIN/g" ~/nginx.conf'
###ssh ubuntu@$1 "sed -i 's/\[DOMAIN-WITH-DOTS-ESCAPED\]/$ESCAPED_DOMAIN/g' ~/nginx.conf"

# ssh ubuntu@$1 "sudo mv ~/nginx.conf /etc/nginx"
# ssh ubuntu@$1 "sudo chmod 644 /etc/nginx/nginx.conf"
# ssh ubuntu@$1 "sudo chown root:root /etc/nginx/nginx.conf"

echo ""
echo "Add cron job to renew SSL certificate"
echo "Add cron job to stop inactive containers (inactive for 5 minutes)"
echo "Add cron job to collect container stats every minute"
echo ""
# create the combined cert file for haproxy after renewing the cert
# sudo cat /etc/letsencrypt/live/azabab.com/fullchain.pem /etc/letsencrypt/live/azabab.com/privkey.pem > /home/ubuntu/proxy-server/haproxy_cert.pem
ssh ubuntu@$1 "echo \"0 */12 * * * sudo /usr/bin/certbot renew --quiet\" | sudo tee -a /var/spool/cron/crontabs/root && cat /etc/letsencrypt/live/azabab.com/fullchain.pem /etc/letsencrypt/live/azabab.com/privkey.pem > /home/ubuntu/proxy-server/haproxy_cert.pem"

ssh ubuntu@$1 "echo \"* * * * * /home/ubuntu/stop_inactive_containers.sh\" | sudo tee -a /var/spool/cron/crontabs/root"
ssh ubuntu@$1 "echo \"* * * * * /home/ubuntu/stats.sh\" | sudo tee -a /var/spool/cron/crontabs/root"
ssh ubuntu@$1 "mkdir -p /home/ubuntu/stats"
ssh ubuntu@$1 "sudo chmod 600 /var/spool/cron/crontabs/root"
ssh ubuntu@$1 "sudo chown root:crontab /var/spool/cron/crontabs/root"

echo ""
echo "*** Build the Docker image ***"
echo ""
ssh ubuntu@$1 "~/inject-hostname-into-container.sh"
ssh ubuntu@$1 "sudo docker build -t pbdocker ."

echo ""
echo "Copy ssh-server files to the server"
echo ""
ssh ubuntu@$1 "mkdir ~/ssh-server"
scp ssh-server/* ubuntu@$1:~/ssh-server

echo ""
echo "*** Build the ssh-server Docker image ***"
echo ""
ssh ubuntu@$1 "cd ~/ssh-server;sudo docker build -t ssh-server ."
#scp files/start-ssh-server.sh ubuntu@$1:~
ssh ubuntu@$1 "~/start-ssh-server.sh"

echo ""
echo "Copy proxy-server files to the server"
echo ""
ssh ubuntu@$1 "mkdir ~/proxy-server"
scp -r proxy-server/* ubuntu@$1:~/proxy-server
echo "Create the combined cert for haproxy"
ssh ubuntu@$1 "~/proxy-server/make-cert.sh"
echo ""
echo "Install HAProxy"
ssh ubuntu@$1 "sudo apt install -y haproxy"
ssh ubuntu@$1 "sudo mv ~/haproxy.service /etc/systemd/system"
ssh ubuntu@$1 "sudo chmod 644 /etc/systemd/system/haproxy.service"
ssh ubuntu@$1 "sudo chown root:root /etc/systemd/system/haproxy.service"
ssh ubuntu@$1 "sudo systemctl enable haproxy.service"
ssh ubuntu@$1 "sudo systemctl restart haproxy.service"
echo ""

echo ""
echo "Setup nats-server"
echo ""
ssh ubuntu@$1 "sudo mv ~/nats-server /usr/bin"
ssh ubuntu@$1 "sudo mv ~/nats.service /etc/systemd/system"
ssh ubuntu@$1 "sudo chmod 644 /etc/systemd/system/nats.service"
ssh ubuntu@$1 "sudo chown root:root /etc/systemd/system/nats.service"
ssh ubuntu@$1 "sudo systemctl enable nats.service"


# echo ""
# echo "Copy nats-server files to the server"
# echo ""
# ssh ubuntu@$1 "mkdir ~/nats-server"
# scp nats-server/* ubuntu@$1:~/nats-server
# ssh ubuntu@$1 "cd ~/nats-server;sudo dpkg -i *.deb"

# echo ""
# echo "*** Build the nats-server Docker image ***"
# echo ""
# ssh ubuntu@$1 "cd ~/nats-server;sudo docker build -t nats-server ."
#scp files/start-nats-server.sh ubuntu@$1:~
#########################################
#### configure nats-server.conf here ####
#########################################
#scp files/start-nats-server.sh ubuntu@$1:~
# replace HOSTNAME
# ssh ubuntu@$1 "~/configure-nats-server.sh"
#ssh ubuntu@$1 "~/start-nats-server.sh"

echo ""
echo "Create a service to run rust-server.exe"
echo ""
ssh ubuntu@$1 "sudo mv ~/rust-server.service /etc/systemd/system"
ssh ubuntu@$1 "sudo chmod 644 /etc/systemd/system/rust-server.service"
ssh ubuntu@$1 "sudo chown root:root /etc/systemd/system/rust-server.service"
ssh ubuntu@$1 "sudo systemctl enable rust-server.service"
ssh ubuntu@$1 "sudo systemctl start rust-server.service"

echo ""
echo "Create a service to run stats-file-server.exe"
echo ""
ssh ubuntu@$1 "sudo mv ~/stats-file-server.service /etc/systemd/system"
ssh ubuntu@$1 "sudo chmod 644 /etc/systemd/system/stats-file-server.service"
ssh ubuntu@$1 "sudo chown root:root /etc/systemd/system/stats-file-server.service"
ssh ubuntu@$1 "sudo systemctl enable stats-file-server.service"
ssh ubuntu@$1 "sudo systemctl start stats-file-server.service"

echo ""
echo "Create a service to monitor container startups"
echo ""
ssh ubuntu@$1 "sudo mv ~/monitor-container-startups.service /etc/systemd/system"
ssh ubuntu@$1 "sudo chmod 644 /etc/systemd/system/monitor-container-startups.service"
ssh ubuntu@$1 "sudo chown root:root /etc/systemd/system/monitor-container-startups.service"
ssh ubuntu@$1 "sudo systemctl enable monitor-container-startups.service"
ssh ubuntu@$1 "sudo systemctl start monitor-container-startups.service"

echo ""
echo "Start the ssh-server in restart mode"
echo ""
ssh ubuntu@$1 "/home/ubuntu/start-ssh-server.sh"

#echo ""
#echo "Reload the domain_ports.txt file without restarting nginx"
#echo ""
#ssh ubuntu@$1  "sudo kill -HUP \$(cat /var/run/nginx.pid)"

echo ""
echo "Reload the cron scheduler"
echo ""
ssh ubuntu@$1 "sudo service cron reload"
ssh ubuntu@$1 "sudo crontab -l"

echo ""
echo "Install Litestream"
echo ""
ssh ubuntu@$1 "sudo dpkg -i litestream-v0.3.9-linux-amd64.deb"
ssh ubuntu@$1 "sudo systemctl enable litestream"
ssh ubuntu@$1 "sudo systemctl start litestream"
echo "create the litestream.config directory"
ssh ubuntu@$1 "sudo mkdir ~/litestream.config"
ssh ubuntu@$1 "mv ~/litestream-v0.3.9-linux-amd64.deb ~/litestream.config"

echo ""
echo "Calling configure server on the app server: https://app.lax.azabab.com/configureserver/$1"
echo "This will create the rclone.conf file"
echo ""
echo "files to be created:"
echo "/root/.config/rclone/rclone.conf"
echo ""
curl -H "Authorization: my_secret_token" https://app.lax.azabab.com/configureserver/$1
echo ""
echo "Configure nats-server"
echo ""

if [ -f "/etc/nats.conf" ]; then
    ssh ubuntu@$1 "sudo systemctl start nats.service"
else
    echo "*******************"
    echo "***** WARNING *****"
    echo "*******************"
    echo "The file /etc/nats.conf does not exist."
    echo "You need to create this file and manually start the nats server:"
    echo "sudo systemctl start nats.service"
    echo "*******************"
fi

echo ""
echo "add the following line to the crontab to gather disk usage stats"
echo "curl -H "Authorization: my_secret_token" https://app.lax.azabab.com/log-disk-usage"
echo ""

echo "************"
echo "*** DONE ***"
echo "************"
echo ""
