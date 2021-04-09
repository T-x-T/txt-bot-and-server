/*
*  LOG HELPER
*  For all the logging needs
*/

//Dependencies
const Persistable = require("../persistance/persistable.js");
const Factory = require("../persistance/factory.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;

//Create the container
var log = {};

//Write a log entry
log.write = async function (level, component, name, payload, timestamp) {
  let entry = new Persistable({name: "log", schema: log.schema});
  await entry.init();
  entry.data = {
    timestamp: timestamp ? timestamp : Date.now(),
    level: level,
    component: component,
    name: name,
    data: payload
  };
  return await entry.create();
};

//Get log entries
//Input: level: the loglevel to query, timestamp: Date after which we give log entries back
log.read = async function (level, timestamp) {
  let factory = new Factory({name: "log", schema: log.schema});
  await factory.connect();

  let filter;
  if(typeof level !== "number") {
    filter = {timestamp: {$gt: timestamp}};
  }else{
    filter = {$and: [{level: level}, {timestamp: {$gt: timestamp}}]};
  }
  
  return await factory.persistanceProvider.retrieveFiltered(filter);
};

//Get log entries by a given id
log.readById = async function (id) {
  let factory = new Factory({name: "log", schema: log.schema});
  await factory.connect();

  return await factory.persistanceProvider.retrieveNewestFiltered({_id: id});
};

//This will delete older than the given amount of days
log.prune = async function(days){
  let factory = new Factory({name: "log", schema: log.schema});
  await factory.connect();

  await factory.persistanceProvider.deleteByFilter({timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}});
};

//This will delete older than the given amount of days of given log level
log.pruneLevel = async function(days, level){
  let factory = new Factory({name: "log", schema: log.schema});
  await factory.connect();

  await factory.persistanceProvider.deleteByFilter({
    $and: [
      {timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}},
      {level: level}
    ]
  });
};

log.schema = {
  timestamp: Date,
  level: Number, //0 = debug, 1 = info, 2 = warn, 3 = error
  component: String,
  name: String,
  data: Mixed
}

//Make log.write global
global.log = log.write;

//Export the container
module.exports = log;
