/*
 *  UNIT TESTS
 *  Testing library using mocha
 */

//Configure config
ENVIRONMENT = 'testing';
console.log(ENVIRONMENT)
require('../config.js')();

//Setup the global emitter
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
emitter = new Emitter();

//Require all modules for init
require('../src/discord_bot/main.js');
require('../src/data');
require('../src/discord_api');

require('../src/auth');
require('../src/log');

require('../src/application');
require('../src/bulletin');
require('../src/stats');
require('../src/post');
require('../src/youtube');

require('../src/discord_bot');
require('../src/web/webServer.js');
require('../src/email');
require('../src/minecraft');

//setup global factories
const MemberFactory = require('../src/user/memberFactory.js');
global.memberFactory = new MemberFactory();
global.memberFactory.connect(); //This isnt await, might cause problems


//Dependencies
const log = require('../src/log'); //lgtm [js/unused-local-variable]

global.log(0, 'test', 'Mocha test started', false);

before("start discord_bot", function(done){
  this.timeout(10000);
  emitter.on("discord_bot_ready", () => done());

  const discord_bot = require("../src/discord_bot");
});

//This makes unhandledPromiseRejections fail tests
process.on('unhandledRejection', (reason, promise) => { 
  console.log(reason);
  throw promise 
});