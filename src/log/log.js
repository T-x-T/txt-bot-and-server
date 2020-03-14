/*
*  LOG HELPER
*  For all the logging needs
*/

//Dependencies
const config = require('../../config.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Get the db object
var db;

//Connect to the db
mongoose.connect(config["mongodb-url"]);
var con = mongoose.connection;

//Gets called when there is an error connecting to the db
con.on('error', function () {
  console.log('Error connecting to database');
});

//Gets called when the connection to the db succeeds
con.on('open', function () {
  console.log('Log Sucessfully connected to database');
  db = con;
});

//Create the container
var log = {};

//Write a log entry
log.write = function (level, name, data) {
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
    document.save(function (err, document) {});
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

//This will delte older than the given amount of days
log.prune = function(days){
  logModel.deleteMany({timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}}, function(err){ log.write(2, 'log.prune failed to prune old logs', {err: err, days: days}); });
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
