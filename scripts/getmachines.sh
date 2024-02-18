fly status -a $1 -j | jq -r '.Machines[] | "\(.id) \(.region)"'
