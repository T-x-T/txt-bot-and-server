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
    level = typeof (level) == 'number' && level >= 0 && level <= 3 ? level : false;
    name = typeof (name) == 'string' && name.trim().length > 0 ? name : false;
    if (level.toString() && name) {
        var document = new logModel({
            level: level,
            name: name,
            data: data
        });
        document.save(function (err, document) {
            if (err) {
                callback('Error saving entry');
            } else {
                callback(false);
            }
        });
    } else {
        callback('One of the inputs is a little weird');
    }

};

//Init stuff
//Log schema
var logSchema = new Schema({
    timestamp: {
        type: Date,
        default: Date.now()
    },
    level: Number,
    name: String,
    data: Object
});
var logModel = mongoose.model('logSchema', logSchema);

//Export the container
module.exports = log;