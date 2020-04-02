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

const discordBot = require('../src/discord_bot/discord_bot.js');
discordBot.init();

before(function(done){
  this.timeout(1000 * 10);
  emitter.once('discord_bot_ready', () => {
    done();
  });
});

const oauth = require('../src/auth/oauth2.js');
oauth.updateUserIdCache();

//Dependencies
const log = require('../src/log'); //lgtm [js/unused-local-variable]
