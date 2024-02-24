# $1 ipv6$
rsync -avz -e "ssh -p 2222 -i /pb/.ssh/ssh_host_rsa_key -o StrictHostKeyChecking=no" /pb/pb_public/ root@[$1]:/pb/pb_public/


