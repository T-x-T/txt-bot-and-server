/*
*  WORKERS HOST
*  This file contains all setInterval functions
*/

//Dependencies
import youtube = require("../youtube/index.js");
import log = require("../log/index.js");
import stats = require("../stats/index.js");
import update = require("./update.js");
import Discord = require("discord.js");

log.prune(30).catch((e: Error) => console.log("log.prune(30) threw:", e.message));
log.pruneLevel(1, 0).catch((e: Error) => console.log("log.pruneLevel(1, 0) threw:", e.message));

export = (config: IConfig, client: Discord.Client) => {
  update.init(config, client)
}

//10 seconds after startup
setTimeout(async () => {
  try {
    await update.updateAllNicks();
    await update.updateAllIGNs();
  } catch (e) {
    console.log("10 seconds after startup threw:", e.message);
    log.write(3, "workers", "10 seconds after startup threw", {err: e.message});
  }
}, 10000);

//Every 5 minutes
setInterval(() => {
  try {
    youtube.checkForNewVideos();
  } catch(e) {
    console.log("youtube.checkForNewVideos threw:", e.message);
    log.write(3, "workers", "youtube.checkForNewVideos threw", {err: e.message});
  }
}, 1000 * 60 * 5);

//Every hour
setInterval(async () => {
  try {
    await update.updateAllIGNs();
    await update.updateAllNicks();
  } catch(e) {
    console.log("every hour threw:", e.message);
    log.write(3, "workers", "every hour threw", {err: e.message});
  }
}, 1000 * 60 * 60);

//Every six hours
setInterval(() => {
  try {
    stats.updateMcStats();
  } catch(e) {
    console.log("every six hours threw:", e.message);
    log.write(3, "workers", "every six hours threw", {err: e.message});
  }
}, 1000 * 60 * 60 * 6);

//Every day
setInterval(async () => {
  try {
    await log.prune(30);
    await log.pruneLevel(1, 0);
  } catch (e) {
    console.log("every day threw:", e.message);
    log.write(3, "workers", "every day threw", {err: e.message});
  }
}, 1000 * 60 * 60 * 24);