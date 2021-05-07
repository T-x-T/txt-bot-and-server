/*
*  LOG HELPER
*  For all the logging needs
*/

//Dependencies
import util = require("util");
import discordHelpers = require("../discord_helpers/index.js");

let config: IConfig;
let environment: EEnvironment;

const log = {
  init(_config: IConfig, _environment: EEnvironment) {
    config = _config;
    environment = _environment;
  },

  write(level: 0 | 1 | 2 | 3, component: string, name: string, payload: any) {
    if(environment == EEnvironment.testing) return;
    if(environment == EEnvironment.staging) {
      console.log(new Date(), `[${level}] ${component}: ${name}`, util.inspect(payload));
    } else {
      if(level === 0) {
        console.log(new Date(), `[DEBUG] ${component}: ${name}`, util.inspect(payload));
      } else {
        let output = "";
        output += level == 1 ? "INFO:\n" : level == 2 ? "WARN:\n" : "ERROR:\n";
        output += `Occured in: ${component}\n`;
        output += name + "\n";
        output += util.inspect(payload);
        discordHelpers.sendMessage(output, config.discord_bot.channel.logs)
      }
    }
  }
};

export = log;
