/*
 *  WORKERS HOST
 *  This file contains all setInterval functions
 */

//Dependencies
const config = require('./../config.js');
const perfLog = require('./../lib/perfLog.js');
const youtube = require('./../lib/youtube.js');

//Every second
setInterval(function () {
    perfLog.execute();
}, 1000);

//Every minute
setInterval(function () {
    youtube.getNewestVideo();
}, 1000 * 60);