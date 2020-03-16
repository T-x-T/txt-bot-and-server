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

const oauth = require('../src/auth/oauth2.js');
oauth.updateUserIdCache();

//Dependencies
const log = require('../src/log/log.js'); //lgtm [js/unused-local-variable]
