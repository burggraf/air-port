# check if argument is empty
# check for two arguments
if [ -z "$1" ] || [ -z "$2" ]
  then
    echo "syntax: ./install.sh <host-name> <domain-name>"
    echo "example: ./install.sh west-1.azabab.com azabab.com"
    exit 1
fi
scp files/start.sh ubuntu@$1:~
ssh ubuntu@$1 "sudo ./build.sh"
