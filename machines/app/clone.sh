# $1 = region from
# $2 = region to 
flyctl volumes fork `fly volumes list | grep $1 | sed 's/\t.*$//'` -a air-port-dev -n pb_data -r $2
fly machines clone `fly machines list | grep sjc | sed 's/\t.*$//'` -r $2 --attach-volume `fly volumes list | grep $2 | sed 's/\t.*$//'`:/pb
