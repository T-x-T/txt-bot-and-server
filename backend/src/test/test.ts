/*
 *  UNIT TESTS
 *  Testing library using mocha
 */

//Configure config
global.g = {};
global.g.ENVIRONMENT = 'testing';
console.log(global.g.ENVIRONMENT)
require('../../config.js')();

//Setup the global emitter
const EventEmitter = require('events');
global.g.emitter = new EventEmitter();

//Require all modules for init
require('../discord_bot/main.js');
require('../discord_api');

require('../auth');
const log = require('../log');

require('../stats');
require('../youtube');

require('../discord_bot');
require('../web/webServer.js');
require('../email');
require('../minecraft');

//Make log.write global
global.g.log = log.write;

//setup global factories
const MemberFactory = require('../user/memberFactory.js');
global.g.memberFactory = new MemberFactory();
global.g.memberFactory.connect(); //This isnt await, might cause problems

global.g.log(0, 'test', 'Mocha test started', false);

before("start discord_bot", function(done){
  this.timeout(10000);
  global.g.emitter.once("discord_bot_ready", () => done());

  const discord_bot = require("../discord_bot");
});

//This makes unhandledPromiseRejections fail tests
process.on('unhandledRejection', (reason, promise) => { 
  console.log(reason);
  throw promise 
});

export default {}