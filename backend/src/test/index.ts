/*
 *  UNIT TESTS
 *  Testing library using mocha
 */

//This makes unhandledPromiseRejections fail tests
process.on("unhandledRejection", (reason, promise) => { 
  console.log(reason);
  throw promise 
});

import init = require("../init/index.js");

const environment = init.getEnv();
const config = init.getConfig(environment);
console.log("Starting with environment:", environment)
import persistance = require("../persistance/index.js");
persistance(config);

//Require all modules for init
import discordHelpers = require("../discord_helpers/index.js");
import auth = require("../auth/index.js");
import youtube = require("../youtube/index.js");
import email = require("../email/index.js");
import minecraft = require("../minecraft/index.js");
import user = require("../user/index.js");
import application = require("../application/index.js");


before(async function(){
  const discordClient = await init.getDiscordClient(config.discord_bot);
  console.log("got discord client")
  discordHelpers.init(config.discord_bot, environment, discordClient);
  auth.init(config, discordClient);
  youtube.init(config.youtube);
  email.init(config.email, environment);
  minecraft.init(config.minecraft, environment);
  user(config);
  application(config);

  testApplication(config);
  testMember(config);

  global.g = {};
  
  const EventEmitter = require('events');
  global.g.emitter = new EventEmitter();
  
  //setup global factories
  const MemberFactory = require("../user/memberFactory.js");
  global.g.memberFactory = new MemberFactory();
  global.g.memberFactory.connect(); //This isnt await, might cause problems
});
  
import testApplication = require("./tests/application.js");
require("./tests/blog.js");
require("./tests/factory.js");
require("./tests/log.js");
import testMember = require("./tests/member.js");
require("./tests/persistable.js");
require("./tests/persistanceProviderMongo.js");
require("./tests/sanity.js");
require("./tests/testFactory.js");
require("./tests/testPersistable.js");