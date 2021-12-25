printf "\nSTARTING in "$NODE_ENV" mode\n\n"

# using log rotate for managing logs
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 4
pm2 set pm2-logrotate:compress true

# using pm2-runtime as suggested by PM2 official website - http://pm2.keymetrics.io/docs/usage/docker-pm2-nodejs/
NODE_ENV="$NODE_ENV" pm2-runtime start ./bin/www
printf "\nSTARTED application successfully"