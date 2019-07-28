/*
 *  PERFORMANCE LOGGER
 *  Logs system utilization data
 */

//Dependencies
const config = require('./../config.js');
const os = require('os');
const log = require('./log.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _data = require('./data.js');

//Create the container
var perfLog = {};

//Buffer variables
var memNode = []; //Total amount of memory used by node in MB
var memFree = []; //Free system memory in MB
var memUsage = []; //System Memory usage in Percent

var second = 0;

//Get the db object
var db;
_data.getDB(function (err, data) {
    if (!err && data) {
        if (db === data) console.log('perfLog Sucessfully connected to database');
        db = data;
    } else {
        console.log('Error connecting to database');
    }
});

//Set up of the model
var perfLogSchema = new Schema({
    timestamp: Date,
    memNodeAvg: Number,
    memNodeMax: Number,
    memFreeAvg: Number,
    memFreeMin: Number,
    memUsageAvg: Number,
    memUsageMax: Number
});
var perfLogModel = new mongoose.model('perfLog', perfLogSchema);

setInterval(function () {
    //Update the buffer at the place of the current second, once every second
    memNode[second] = Math.round(process.memoryUsage().rss / 1024 / 1024);
    memFree[second] = Math.round(os.freemem() / 1024 / 1024);
    memUsage[second] = Math.round((1 - (memFree[second] / (os.totalmem() / 1024 / 1024))) * 100);

    //Save everything to the database once a minute
    if (second == 59) {
        //Reset the second counter
        second = 0;

        //Prepare the data
        var memNodeAvg = perfLog.getValues(memNode, false);
        var memNodeMax = memNodeAvg.max;
        memNodeAvg = memNodeAvg.avg;
        var memFreeAvg = perfLog.getValues(memFree, true);
        var memFreeMin = memFreeAvg.max;
        memFreeAvg = memFreeAvg.avg;
        var memUsageAvg = perfLog.getValues(memUsage, false);
        var memUsageMax = memUsageAvg.max;
        memUsageAvg = memUsageAvg.avg;

        //Write the data to the database
        var document = new perfLogModel({
            timestamp: Date.now(),
            memNodeAvg: memNodeAvg,
            memNodeMax: memNodeMax,
            memFreeAvg: memFreeAvg,
            memFreeMin: memFreeMin,
            memUsageAvg: memUsageAvg,
            memUsageMax: memUsageMax
        });
        document.save(function (err, document) {});

    } else {
        //Advance the second counter
        second++;
    }
}, 1000);

//get average from array
perfLog.getValues = function (data, inverted) {
    var avg = 0;
    var max = -1;
    for (var i = 0; i < 60; i++) {
        try {
            avg += data[i];
            if (!inverted) {
                if (data[i] > max) max = data[i];
            } else {
                if (data[i] < max || i == 0) max = data[i];
            }
        } catch (e) {
            log.write(2, 'Error reading from array in perfLog');
        }
    }
    avg = Math.round(avg / 60);
    return {
        avg: avg,
        max: max
    };
};

//Export the container
module.exports = perfLog;