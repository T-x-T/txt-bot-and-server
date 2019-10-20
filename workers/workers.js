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

//Every minute
setInterval(function () {
  try {
    youtube.getNewestVideo();
  } catch (e) {
    log.write(3, 'Workers: Cant execute getNewestVideo', { Error: e });
  }
}, 1000 * 60);

//Every hour
setInterval(function(){
  mc_helpers.updateAllUUIDs(false);
  mc_helpers.updateStats();
  mc_helpers.updateAllIGNs();
}, 1000 * 60 * 60);
