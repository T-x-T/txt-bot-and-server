/*
 *  TESTING OF EXISTING FEATURES
 *  Testing library using mocha
 */
//Setup the global emitter
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
emitter = new Emitter();

global.cache = {};
global.cache.discordUserObjects = {};

const discordBot = require('../src/discord_bot');
discordBot.init();

before(function(done){
  this.timeout(1000 * 10);
  emitter.once('discord_bot_ready', () => {
    done();
  });
});

//Dependencies
const log = require('../src/log'); //lgtm [js/unused-local-variable]

global.log(0, 'Mocha test started', false);
