/*
*  LOG HELPER
*  For all the logging needs
*/

//Dependencies
const data = require('../data');

//Create the container
var log = {};

//Write a log entry
log.write = function (level, name, payload, callback) {
  data.new({
    timestamp: Date.now(),
    level: level,
    name: name,
    data: payload
  }, 'log', false, function (err, doc) {
    if(typeof callback === 'function'){
      callback(err, doc);
    }
  });
};

//Get log entries
//Input: level: the loglevel to query, timestamp: Date after which we give log entries back
log.read = function (level, timestamp, callback) {
  let filter = { timestamp: { $gt: timestamp } };
  if (level) filter = { $and: [{ level: level }, { timestamp: { $gt: timestamp } }] };

  data.get(filter, 'log', false, function (err, docs) {
    if (!err) {
      callback(false, docs);
    } else {
      callback(err, false);
    }
  });
};

//Get log entries by a given id
log.readById = function (id, callback) {
  data.get({_id: id}, 'log', {first: true}, function(err, doc){
    if (!err) {
      callback(false, doc);
    } else {
      callback(err, false);
    }
  })
};

//This will delete older than the given amount of days
log.prune = function(days, callback){
  data.delete({timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}}, 'log', false, function(err){
    if(err) log.write(2, 'log.prune failed to prune old logs', {err: err, days: days});
    if(typeof callback === 'function') callback(err);
  });
};

//This will delete older than the given amount of days of given log level
log.pruneLevel = function(days, level){
  data.delete({$and: [
    {timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}},
    {level: level}
  ]}, 'log', false, function(err){
    if(err) log.write(2, 'log.prune failed to prune old logs', {err: err, days: days});
  });
};

//Make log.write global
global.log = log.write;

//Export the container
module.exports = log;
