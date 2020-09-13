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