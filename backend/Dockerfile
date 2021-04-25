FROM node:alpine

# Set workdir
WORKDIR /srv/txt_bot_and_server/

# Bundle APP files
COPY . .

# Install app dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install --production

# expose port
EXPOSE 4000

CMD [ "npm", "run", "prod" ]