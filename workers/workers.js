/*
 *  WORKERS HOST
 *  This file contains all setInterval functions
 */

//Dependencies
const config = require('./../config.js');
const perfLog = require('./../lib/perfLog.js');
const youtube = require('./../lib/youtube.js');
const log = require('./../lib/log.js');
const mc_helpers = require('./../lib/mc_helpers.js');

//Stuff that should run on startup
try {
    youtube.getNewestVideo()
} catch (e) {
    log.write(3, 'Workers: Cant execute getNewestVideo', { Error: e }, function (err) { });
    console.log('error')
}

//Every second
setInterval(function () {
    //perfLog.execute();
}, 1000);

//Every minute
setInterval(function () {
    try {
        youtube.getNewestVideo()
    } catch (e) {
        log.write(3, 'Workers: Cant execute getNewestVideo', { Error: e }, function (err) { });
        console.log('error')
    }
}, 1000 * 60);

//Every 5 minutes
setInterval(function(){

}, 1000 * 60 * 5);

//Every hour
setInterval(function(){
  mc_helpers.updateAllUUIDs(false);
  mc_helpers.updateStats();
  mc_helpers.updateAllIGNs();
}, 1000 * 60 * 60);
