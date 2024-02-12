# init with:  wrangler pages project create
npm run build 
# && wrangler pages deploy --project-name azabab ./build
scp -P 2222 -r build/* app@east-3.azabab.com:/pb_public
scp -P 2222 -r build/* app@east-4.azabab.com:/pb_public
scp -P 2222 -r build/* app@west-1.azabab.com:/pb_public
