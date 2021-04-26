/*
*  INDEX FILE
*  for starting all components
*/

//Initialize config
global.g = {};
global.g.ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV : 'staging';
console.log(global.g.ENVIRONMENT)
require("../config.js")();

//Setup the global emitter
const EventEmitter = require("events");
global.g.emitter = new EventEmitter();

//Require all modules for init
require("./discord_bot/main.js");
require("./discord_api/index.js");

require("./auth/index.js");
const log = require("./log/index.js");

require("./stats/index.js");
require("./youtube/index.js");

require("./discord_bot/index.js");
require("./web/webServer.js")();
require("./email/index.js");
require("./minecraft/index.js");

require("./workers/index.js");

//Make log.write global
global.g.log = log.write;
//Log that the app got started
global.g.log(1, 'index', 'Application started', null);

process.on('uncaughtException', (err: Error, origin: string) => {
  global.g.emitter.emit("crash", err, origin);
  console.error(err.stack);
  setTimeout(() => {
    process.exit(1);
  }, 200);
});

export default {}