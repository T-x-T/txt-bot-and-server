/*
*  INDEX FILE
*  for starting all components
*/

//Setup the global emitter
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
emitter = new Emitter(); 

//Dependencies
const log = require('./src/log'); //lgtm [js/unused-local-variable]
const webServer = require('./src/web/webServer.js');
const discordBot = require('./src/discord_bot');
const workers = require('./src/workers'); //lgtm [js/unused-local-variable]
const email = require('./src/email'); //lgtm [js/unused-local-variable]

//Log that the app got started
global.log(1, 'Application started', null);

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
