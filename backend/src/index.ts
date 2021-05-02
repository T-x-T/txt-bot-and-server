/*
*  INDEX FILE
*  for starting all components
*/

//Initialize config
global.g = {};
global.g.ENVIRONMENT = process.env.NODE_ENV ? process.env.NODE_ENV : "staging";
console.log(global.g.ENVIRONMENT)
require("../config.js")();

//Setup the global emitter
import EventEmitter = require("events");
global.g.emitter = new EventEmitter();

//Require all modules for init
require("./discord_bot/main.js");
require("./discord_api/index.js");

require("./auth/index.js");
import log = require("./log/index.js");

require("./stats/index.js");
require("./youtube/index.js");

import discordHelpers = require("./discord_bot/index.js");
require("./web/webServer.js")();
require("./email/index.js");
require("./minecraft/index.js");

require("./workers/index.js");

//Log that the app got started
log.write(1, "index", "Application started", null);

process.on("uncaughtException", (err: Error, origin: string) => {
  discordHelpers.sendCrashMessage(err, origin);
  console.error(err);
  setTimeout(() => {
    process.exit(1);
  }, 200);
});