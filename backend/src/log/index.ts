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

    console.log(new Date(), `[${level}] ${component}: ${name}`, util.inspect(payload));

    if(environment == EEnvironment.prod && level > 0) {
      let output = "";
      output += level == 1 ? "INFO:\n" : level == 2 ? "WARN:\n" : "ERROR:\n";
      output += `Occured in: ${component}\n`;
      output += name + "\n";
      output += util.inspect(payload);
      discordHelpers.sendMessage(output, config.discord_bot.channel.logs)
    }
  }
};

export = log;
