/*
 *  INDEX FILE
 *  for starting all components
 */

//Dependencies
const config = require('./config.js');
const webServer = require('./web/webServer.js');
const discordBot = require('./discord-bot/discord-bot.js');
const log = require('./lib/log.js');
const workers = require('./workers/workers.js');
//Log that the app got started
log.write(1, 'Application started', null, function (err) {
    if (err) {
        console.log('Error writing log: ' + err);
    }
});

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