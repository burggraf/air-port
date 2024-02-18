fly status -a "$1" -j | jq -r --arg region "$2" '.Machines[] | select(.region == $region) | .id'

