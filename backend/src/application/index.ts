import Application = require("./application.js");
import ApplicationFactory = require("./applicationFactory.js");

export = (config: IConfig) => {
  Application.setConfig(config);
  ApplicationFactory.setConfig(config);
}