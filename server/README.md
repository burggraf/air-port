# Installing a server
The `install.sh` script will install and configure everything you need:

- Install Docker
- Install Wildcard SSL Certificate
- Copy all necessary files to the server
    - pocketbase
    - rust-server.exe
    - marmot
    - configuration scripts
    - and more...
- Install and configure Nginx
- Add cron job to renew the SSL certificate
- Build the Docker image (pbdocker)
- Create a service to run rust-server.exe (to start containers)
- Add cron job to stop containers that have been inactive more than 5 minutes
- Set up a set of 8 sample domains for quick testing (a.domain.com through h.domain.com)
- Create the ssh-server Docker image to support scp command-line copying files to/from the server

## Assumptions

- Your server is running Ubuntu 23.04 (other versions may work, but it's only been tested with this version)
- You can log into your server from your local machine via `ssh` (you have your ssh key installed on the server and can run `ssh ubuntu@mydomain.com` to reach it without using a password).
- You log into your server as user `ubuntu` and not as `root`.
- You have a Cloudflare account (free is fine).
- Your domain's DNS is hosted and managed at Cloudflare.

If any of the above items are not true, this probably won't work for you and you'll need to modify things to suit your setup.

## Prerequisites
Before running the install script, you'll need to do a little DNS setup via Cloudflare:

### Configure Wildcard DNS Record
In cloudflare, you'll need to set up a wildcard DNS "A" record.

Examples:
If your server's ip is `1.2.3.4` and you want to set up `*.mydomain.com`, create an `A` record named `*` pointing to `1.2.3.4`

If your server's ip is `1.2.3.4` and you want to set up `*.west-1.mydomain.com`, create an `A` record named `*.west-1` pointing to `1.2.3.4`

After setting up your wildcard DNS record, test it by pinging `<anything>.mydomain.com` (or whatever domain you've set up.)

For example:
`ping abc.mydomain.com` should resolve to `1.2.3.4`

### Create Cloudflare API Credentials

Create the file `./private/cloudflare.ini` with your Cloudflare API credentials.

Sample:

```
dns_cloudflare_email = user@host.com
dns_cloudflare_api_key = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

You can find your api key here: 
[Cloudflare My Profile Page](https://dash.cloudflare.com/profile/api-tokens)
(Cloudflare web site / My Profile / API Tokens / Global API Key)

## Installing Your Server
Once everything is in place (cloudflare.ini file and your DNS record) you can run the install script:

`./install.sh <host-name> <domain-name>`
where:
- `<host-name>` is the host you want to install on
    - this must be available via `ssh`, so if your host-name is `west-1.mydomain.com`, you need to be able to ssh into your server with `ssh ubuntu@west-1.mydomain.com`
    - your local `ssh` key must be installed on the server so you can `ssh` into the server without using a password
- `<domain-name>` is the domain name you're installing
    - this should match the wildcard domain you set up earlier (everything after the `*.` part)
    - examples: `mydomain.com` or `west-1.domain.com`

## Testing It Out
After the script completes, you can visit the test domains in your browser to make sure things are working.  For example, if you've installed the wildcard domain `*.mydomain.com`:

- `https://a.mydomain.com/_/`
- `https://b.mydomain.com/_/`
- `https://c.mydomain.com/_/`

...etc.