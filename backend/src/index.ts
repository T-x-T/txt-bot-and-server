/*
*  INDEX FILE
*  for starting all components
*/

import init = require("./init/index.js");

const environment = init.getEnv();
const config = init.getConfig(environment);
console.log("Starting with environment:", environment)
import persistance = require("./persistance/index.js");
persistance(config);

//Require all modules for init
import discordBot = require("./discord_bot/index.js");
import discordHelpers = require("./discord_helpers/index.js");
import auth = require("./auth/index.js");
import log = require("./log/index.js");
import youtube = require("./youtube/index.js");
import webServer = require("./web/index.js");
import email = require("./email/index.js");
import minecraft = require("./minecraft/index.js");
import user = require("./user/index.js");
import application = require("./application/index.js");
import workers = require("./workers/index.js");
import eventScheduler = require("./eventScheduler/index.js");

start();

process.on("uncaughtException", (err: Error, origin: string) => {
  discordHelpers.sendCrashMessage(err, origin);
  console.error(err);
  setTimeout(() => {
    process.exit(1);
  }, 200);
});

async function start() {
  const discordClient = await init.getDiscordClient(config.discord_bot);
  console.log("got discord client")
  discordHelpers.init(config.discord_bot, environment, discordClient);
  await discordBot.init(config, discordClient);
  log.init(config, environment);
  auth.init(config, discordClient);
  youtube.init(config.youtube);
  webServer(config, environment);
  email.init(config.email, environment);
  minecraft.init(config.minecraft, environment);
  user(config);
  application(config);
  eventScheduler.init();
  workers(config, discordClient);

  log.write(1, "index", "Application started", null);
}

export = start;