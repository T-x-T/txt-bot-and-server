/*
 *  WORKERS HOST
 *  This file contains all setInterval functions
 */

//Dependencies
const config = require('./../config.js');
const perfLog = require('./../lib/perfLog.js');
const youtube = require('./../lib/youtube.js');
const log = require('./../lib/log.js');

//Every second
setInterval(function () {
    perfLog.execute();
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