FROM node:carbon
MAINTAINER Pravin Lolage
WORKDIR /usr/src/app
RUN git clone -b master https://x-auth-token:ygb88zTPk5wXR9JjWckQ@gitlab.com/testautomationacademy/product-rest-api.git .
RUN npm install
RUN npm install pm2 -g
EXPOSE 3000
CMD [ "sh", "launch.sh" ]