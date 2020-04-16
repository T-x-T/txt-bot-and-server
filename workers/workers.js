/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
//const config = require('./../config.js');
const youtube = require('../src/youtube');
const log = require('./../src/log');
const mc_helpers = require('../src/minecraft');
const discord_api = require('../src/discord_api');
const widgets = require('../src/web/widgets.js');
const discord_helpers = require('./../src/discord_bot');
const user = require('../src/user');
const stats = require('../src/stats');

//Stuff that should run on startup
mc_helpers.updateOnlinePlayers();
log.prune(30);
//mc_helpers.createStatsObjectTemplate(function(){});
widgets.init();

//Stuff that should be run 5 seconds after startup, ONLY FOR THINGS THAT NEED THE BOT LOGGED IN
setTimeout(function(){
  mc_helpers.updateRoles();
}, 1000 * 5);

//Contains discord user objects mapped by the discord id; gets cleared once an hour in workers
global.cache = {};
global.cache.discordUserObjects = {};
discord_api.updateCache();

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
}, 1000 * 60 * 60 * 24);
