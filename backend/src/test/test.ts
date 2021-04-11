/*
 *  UNIT TESTS
 *  Testing library using mocha
 */

//Configure config
global.g.ENVIRONMENT = 'testing';
console.log(global.g.ENVIRONMENT)
require('../../global.g.config.js')();

//Setup the global emitter
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
emitter = new Emitter();

//Require all modules for init
require('../discord_bot/main.js');
require('../discord_api');

require('../auth');
require('../log');

require('../stats');
require('../youtube');

require('../discord_bot');
require('../web/webServer.js');
require('../email');
require('../minecraft');

//setup global factories
const MemberFactory = require('../user/memberFactory.js');
global.g.memberFactory = new MemberFactory();
global.g.memberFactory.connect(); //This isnt await, might cause problems


//Dependencies
const log = require('../log'); //lgtm [js/unused-local-variable]

global.g.log(0, 'test', 'Mocha test started', false);

before("start discord_bot", function(done){
  this.timeout(10000);
  global.g.emitter.emit("discord_bot_ready", () => done());

  const discord_bot = require("../discord_bot");
});

//This makes unhandledPromiseRejections fail tests
process.on('unhandledRejection', (reason, promise) => { 
  console.log(reason);
  throw promise 
});