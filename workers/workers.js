/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
//const config = require('./../config.js');
const youtube = require('../src/youtube/youtube.js');
const log = require('./../src/log/log.js');
const mc_helpers = require('../src/minecraft/mc_helpers.js');
const oauth = require('../src/auth/oauth2.js');
const widgets = require('../src/web/widgets.js');
const discord_helpers = require('./../src/discord_bot/discord_helpers.js');

//Stuff that should run on startup
mc_helpers.updateOnlinePlayers();
log.prune(30);
mc_helpers.createStatsObjectTemplate(function(){});
widgets.init();

//Stuff that should be run 5 seconds after startup, ONLY FOR THINGS THAT NEED THE BOT LOGGED IN
setTimeout(function(){
  mc_helpers.updateRoles();
}, 1000 * 5);

//Contains discord user objects mapped by the discord id; gets cleared once an hour in workers
global.cache = {};
global.cache.discordUserObjects = {};
oauth.updateUserIdCache();

//Every minute
setInterval(function () {
  mc_helpers.updateOnlinePlayers();
}, 1000 * 60);

//Every 5 minutes
setInterval(function(){
  try {
    youtube.getNewestVideo();
  } catch(e) {
    log.write(3, 'Workers: Cant execute getNewestVideo', {Error: e});
  }
}, 1000 * 60 * 5);

//Every hour
setInterval(function(){
  mc_helpers.updateAllUUIDs(false);
  mc_helpers.updateAllIGNs();
  mc_helpers.updateRoles();
  discord_helpers.updateAllNicks();
  oauth.updateUserIdCache();
}, 1000 * 60 * 60);

//Every six hours
setInterval(function(){
  mc_helpers.downloadStats();

  //Timeout so the stats finished downloading
  setTimeout(function(){
    mc_helpers.updateStats();
  }, 1000);

  mc_helpers.createStatsObjectTemplate(function() {});
}, 1000 * 60 * 60 * 6);

//Every day
setInterval(function(){
  log.prune(30);
}, 1000 * 60 * 60 * 24);
