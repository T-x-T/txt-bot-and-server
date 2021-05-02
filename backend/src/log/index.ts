/*
*  LOG HELPER
*  For all the logging needs
*/

//Dependencies
import Persistable = require("../persistance/persistable.js");
import Factory = require("../persistance/factory.js");
import mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;

const log = {
  async write(level: number, component: string, name: string, payload: any, timestamp?: Date) {
    let entry = new Persistable({name: "log", schema: log.schema});
    await entry.init();
    entry.data = {
      timestamp: timestamp ? timestamp : new Date(),
      level: level,
      component: component,
      name: name,
      data: payload
    };
    return await entry.create();
  },

  async read(level: number | boolean, timestamp: Date): Promise<any[]> {
    let factory = new Factory({name: "log", schema: log.schema});
    await factory.connect();

    let filter;
    if(typeof level !== "number") {
      filter = {timestamp: {$gt: timestamp}};
    } else {
      filter = {$and: [{level: level}, {timestamp: {$gt: timestamp}}]};
    }

    return await factory.persistanceProvider.retrieveFiltered(filter);
  },

  async readById(id: string): Promise<any> {
    let factory = new Factory({name: "log", schema: log.schema});
    await factory.connect();

    return await factory.persistanceProvider.retrieveNewestFiltered({_id: id});
  },

  async prune(days: number) {
    let factory = new Factory({name: "log", schema: log.schema});
    await factory.connect();

    await factory.persistanceProvider.deleteByFilter({timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}});
  },

  async pruneLevel(days: number, level: number) {
    let factory = new Factory({name: "log", schema: log.schema});
    await factory.connect();

    await factory.persistanceProvider.deleteByFilter({
      $and: [
        {timestamp: {$lte: new Date(Date.now() - 1000 * 60 * 60 * 24 * days)}},
        {level: level}
      ]
    });
  },

  schema: {
    timestamp: Date,
    level: Number, //0 = debug, 1 = info, 2 = warn, 3 = error
    component: String,
    name: String,
    data: Mixed
  }
};

export = log;
