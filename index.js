/*
*  INDEX FILE
*  for starting all components
*/

//Dependencies
const log = require('./lib/log.js');
const webServer = require('./web/webServer.js');
const discordBot = require('./discord-bot/discord_bot.js');
const workers = require('./workers/workers.js');

//Log that the app got started
log.write(1, 'Application started', null);

//Create the container
var app = {};

//Init
app.init = function () {
  webServer.init();
  discordBot.init();
};

//Call init
app.init();

//Export the container
module.exports = app;
