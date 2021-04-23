FROM keymetrics/pm2:latest-alpine

# Set workdir
WORKDIR /srv/txt_bot_and_server/

# Bundle APP files
COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# Build
RUN npm run build

# expose port
EXPOSE 4000



CMD [ "pm2-runtime", "start", "pm2.json" ]