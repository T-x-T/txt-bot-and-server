/*
 *  UNIT TESTS
 *  Testing library using mocha
 */

//Configure config
global.g = {};
global.g.ENVIRONMENT = "testing";
console.log(global.g.ENVIRONMENT)
require("../../config.js")();

//Setup the global emitter
import EventEmitter = require("events");
global.g.emitter = new EventEmitter();

//Require all modules for init
require("../discord_bot/main.js");
require("../discord_api");

require("../auth");
import log = require("../log");

require("../stats");
require("../youtube");

import discordBot = require("../discord_bot/index.js");
require("../web/webServer.js");
require("../email");
require("../minecraft");

//setup global factories
const MemberFactory = require("../user/memberFactory.js");
global.g.memberFactory = new MemberFactory();
global.g.memberFactory.connect(); //This isnt await, might cause problems

log.write(0, "test", "Mocha test started", false);

before("start discord_bot", function(done){
  this.timeout(10000);
  callDoneWhenLoggedIn(done);
});

function callDoneWhenLoggedIn(done: Function) {
  if(discordBot.client.status === 0) {
    done();
  } else {
    setTimeout(() => callDoneWhenLoggedIn(done), 10);
  }
}

//This makes unhandledPromiseRejections fail tests
process.on("unhandledRejection", (reason, promise) => { 
  console.log(reason);
  throw promise 
});