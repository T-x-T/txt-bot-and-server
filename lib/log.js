/*
 *  LOG HELPER
 *  For all the logging needs
 */

//Dependencies
const config = require('./../config.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const _data = require('./data.js');

//Get the db object
var db;
_data.getDB(function (err, data) {
    if (!err && data) {
        if (db === data) console.log('Log Sucessfully connected to database');
        db = data;
    } else {
        console.log('Error connecting to database');
    }
});

//Create the container
var log = {};

//Write a log entry
log.write = function (level, name, data, callback) {
    //Checking the inputs
    level = typeof (level) == 'number' && level >= config["log-level"] && level <= 3 ? level : false;
    name = typeof (name) == 'string' && name.trim().length > 0 ? name : false;
    if (typeof(level) == 'number' && level.toString() && name) {
        var document = new logModel({
            timestamp: Date.now(),
            level: level,
            name: name,
            data: data
        });
        document.save(function (err, document) {
            if (err) {
                callback('Error saving entry: ' + document + ' with error: ' + err);
            } else {
                callback(false);
            }
        });
    } else {
        callback('One of the inputs is a little weird');
    }

};

//Get log entries
//Input: level: the loglevel to query, timespan: Date after which we give log entries back
log.read = function (level, timestamp, callback) {
    if (level) {
        logModel.find({ level: level }).where('timestamp').gt(timestamp).exec(function (err, data) {
            if (!err) {
                callback(data);
            } else {
                callback(false);
            }
        });
    } else {
        logModel.find().where('timestamp').gt(timestamp).exec(function (err, data) {
            if (!err) {
                callback(data);
            } else {
                callback(false);
            }
        });
    }

};

//Get log entries by a given id
log.readById = function (id, callback) {
    logModel.findById(id, function (err, data) {
        if (!err) {
            callback(data);
        } else {
            callback(false);
        }
    });
};

//Init stuff
//Log schema
var logSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now()
    },
    level: Number, //0 = debug, 1 = info, 2 = warn, 3 = error
    name: String,
    data: Object
});
var logModel = mongoose.model('log', logSchema);

//Export the container
module.exports = log;
