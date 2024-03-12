KEY="$1"
AUTH_KEYS="/pb/.ssh/authorized_keys"
grep -qxF "$KEY" "$AUTH_KEYS" || echo "$KEY" >> "$AUTH_KEYS"
