import Factory = require("./factory.js");
import Persistable = require("./persistable.js");
import Mongo = require("./mongo.js");

export = (config: IConfig) => {
  Factory.setConfig(config);
  Persistable.setConfig(config);
  Mongo.mongoDbUrl = config.data.mongodb_url;
}