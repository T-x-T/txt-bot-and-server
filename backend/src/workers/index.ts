/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
import youtube = require("../youtube/index.js");
import log = require("../log/index.js");
import mc_helpers = require("../minecraft/index.js");
import stats = require("../stats/index.js");
import update = require("./update.js");
import rcon = require("../minecraft/rcon.js");

//Stuff that should run on startup
mc_helpers.updateOnlinePlayers();

log.prune(30).catch((e: Error) => console.log("failed to prune logs:", e));
log.pruneLevel(1, 0).catch((e: Error) => console.log("failed to prune logs:", e));

//Contains discord user objects mapped by the discord id; gets cleared once an hour in workers
global.g.cache = {};
global.g.cache.discordUserObjects = {};
update.updateUserIdCache();

global.g.cache.minecraftServerVersion = "";
rcon.getServerVersion((res: string) => global.g.cache.minecraftServerVersion = res);

//10 seconds after startup
setTimeout(() => {
  update.updateAllNicks();
  update.updateAllIGNs();
  update.updateUserIdCache();
}, 10000);

//Every minute
setInterval(function () {
  mc_helpers.updateOnlinePlayers();
}, 1000 * 60);

//Every 5 minutes
setInterval(function(){
  try {
    youtube.getNewestVideo();
  } catch(e) {
    global.g.log(3, 'workers', 'Workers: Cant execute getNewestVideo', {Error: e});
  }
}, 1000 * 60 * 5);

//Every hour
setInterval(function(){
  update.updateAllNicks();
  update.updateAllIGNs();
  update.updateAllNicks();
  update.updateUserIdCache();
  rcon.getServerVersion((res: string) => global.g.cache.minecraftServerVersion = res);
}, 1000 * 60 * 60);



//Every six hours
setInterval(function(){
  stats.updateMcStats();
}, 1000 * 60 * 60 * 6);



//Every day
setInterval(function(){
  log.prune(30).catch((e: Error) => console.log("failed to prune logs:", e));
  log.pruneLevel(1, 0).catch((e: Error) => console.log("failed to prune logs:", e));
}, 1000 * 60 * 60 * 24);