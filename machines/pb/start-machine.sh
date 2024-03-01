#!/bin/sh
curl --request POST \
-H "Authorization: Bearer `$FLY_TOKEN`" \
--url https://api.machines.dev/v1/apps/$FLY_APP_NAME/machines/$1/start