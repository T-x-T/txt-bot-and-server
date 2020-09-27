/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
const youtube         = require('../youtube');
const log             = require('../log');
const mc_helpers      = require('../minecraft');
const widgets         = require('../web/widgets.js');
const stats           = require('../stats');
const discord_update  = require('../discord_bot/update.js');

//Stuff that should run on startup
mc_helpers.updateOnlinePlayers();

log.prune(30);
log.pruneLevel(1, 0);

widgets.init();

//Contains discord user objects mapped by the discord id; gets cleared once an hour in workers
global.cache = {};
global.cache.discordUserObjects = {};
discord_update.updateUserIdCache();



//Every minute
setInterval(function () {
  mc_helpers.updateOnlinePlayers();
}, 1000 * 60);



//Every 5 minutes
setInterval(function(){
  try {
    youtube.getNewestVideo();
  } catch(e) {
    global.log(3, 'workers', 'Workers: Cant execute getNewestVideo', {Error: e});
  }
}, 1000 * 60 * 5);

setTimeout(() => {
  discord_update.updateAllNicks();
  mc_helpers.updateAllIGNs();
  discord_update.updateAllNicks();
  discord_update.updateUserIdCache();
  console.log("yeeett")
},2000)


//Every hour
setInterval(function(){
  discord_update.updateAllNicks();
  mc_helpers.updateAllIGNs();
  discord_update.updateAllNicks();
  discord_update.updateUserIdCache();
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
