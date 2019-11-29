/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
const config = require('./../config.js');
const youtube = require('./../lib/youtube.js');
const log = require('./../lib/log.js');
const mc_helpers = require('./../lib/mc_helpers.js');

//Stuff that should run on startup
try {
  youtube.getNewestVideo()
} catch (e) {
  log.write(3, 'Workers: Cant execute getNewestVideo', { Error: e });
}
mc_helpers.updateOnlinePlayers();

//Contains discord user objects mapped by the discord id; gets cleared once an hour in workers
global.cache = {}
global.cache.discordUserObjects = {};

//Every minute
setInterval(function () {
  try {
    youtube.getNewestVideo();
  } catch (e) {
    log.write(3, 'Workers: Cant execute getNewestVideo', { Error: e });
  }

  mc_helpers.updateOnlinePlayers();
}, 1000 * 60);

//Every hour
setInterval(function(){
  mc_helpers.updateAllUUIDs(false);
  mc_helpers.updateAllIGNs();
  global.cache.discordUserObjects = {};
}, 1000 * 60 * 60);

//Every six hours
setInterval(function(){
  mc_helpers.downloadStats();
  setTimeout(function(){
    mc_helpers.updateStats();
  }, 1000)
}, 1 * 60 * 60);
