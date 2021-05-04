import webserver = require("./webServer.js");
import handlers = require("./handlers.js");

export = (config: IConfig, environment: EEnvironment) => {
  webserver(config, environment);
  handlers.init(config);
}