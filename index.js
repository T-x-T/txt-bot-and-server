/*
*  INDEX FILE
*  for starting all components
*/

//Initialize config
ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV : 'staging';
console.log(ENVIRONMENT)
require('./config.js')();

//Setup the global emitter
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
emitter = new Emitter(); 

//Require all modules for init
require('./src/data');
require('./src/discord_api');

require('./src/auth');
require('./src/log');

require('./src/user');
require('./src/application');
require('./src/bulletin');
require('./src/stats');
require('./src/post');
require('./src/youtube');

require('./src/discord_bot');
require('./src/web/webServer.js');
require('./src/email');
require('./src/minecraft');

require('./src/workers');

//Log that the app got started
global.log(1, 'index', 'Application started', null);

//Create the container
var app = {};

//Export the container
module.exports = app;
