/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
//const config = require('./../config.js');
const youtube         = require('../youtube');
const log             = require('../log');
const mc_helpers      = require('../minecraft');
const discord_api     = require('../discord_api');
const widgets         = require('../web/widgets.js');
const discord_helpers = require('../discord_bot');
const user            = require('../user');
const stats           = require('../stats');

//Stuff that should run on startup
mc_helpers.updateOnlinePlayers();

log.prune(30);
log.pruneLevel(1, 0);

widgets.init();

//Contains discord user objects mapped by the discord id; gets cleared once an hour in workers
global.cache = {};
global.cache.discordUserObjects = {};
discord_api.updateCache();



//Stuff that should be run once the bot logged in
emitter.once('discord_bot_ready', (client) => {
  mc_helpers.updateRoles();
});



//Every minute
setInterval(function () {
  mc_helpers.updateOnlinePlayers();
}, 1000 * 60);



//Every 5 minutes
setInterval(function(){
  try {
    youtube.getNewestVideo();
  } catch(e) {
    global.log(3, 'Workers: Cant execute getNewestVideo', {Error: e});
  }
}, 1000 * 60 * 5);



//Every hour
setInterval(function(){
  user.updateNicks();
  mc_helpers.updateRoles();
  discord_helpers.updateAllNicks();
  discord_api.updateCache();
}, 1000 * 60 * 60);



//Every six hours
setInterval(function(){
  stats.updateMcStats();
}, 1000 * 60 * 60 * 6);



//Every day
setInterval(function(){
  log.prune(30);
  log.pruneLevel(1, 0);
}, 1000 * 60 * 60 * 24);
