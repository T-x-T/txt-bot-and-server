FROM keymetrics/pm2:latest-alpine

# Bundle APP files
COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# expose port
EXPOSE 4000

WORKDIR /srv/txt_bot_and_server/

CMD [ "pm2-runtime", "start", "pm2.json" ]