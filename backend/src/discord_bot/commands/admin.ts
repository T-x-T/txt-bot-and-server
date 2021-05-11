/*
*	COMMAND FILE FOR ADMIN COMMANDS
*	Command for all the admin thingys
*/

import mc_helpers = require("../../minecraft/index.js");
import auth = require("../../auth/index.js");
import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

import ApplicationFactory = require("../../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
applicationFactory.connect(); 

import Discord = require("discord.js");

export = {
  name: "admin",
  description: "Commands only for admins",
  aliases: ["a"],
  usage: "delete <message count> | activate @mention | inactivate @mention | forceaccept @mention (if accepting their application didnt work for some reason) | cmd <server> <command> (valid servers are main_smp creative_server and modded(I think))",

  async execute(message: Discord.Message, args: string[]) {
    if(auth.getAccessLevelFromDiscordId(message.member.id) < 8) {
      message.channel.send("Sorry, you are not authorized to do that");
      return;
    }

    switch(args[0]) {
      case "delete":
        let amountToDelete = parseInt(args[1]) + 1;

        //Check if its a real number
        if(isNaN(amountToDelete) || amountToDelete < 2) {
          message.channel.send("Thats not a real number");
          return;
        } 

        while(amountToDelete > 0) {
          if(amountToDelete >= 100) {
            await message.channel.bulkDelete(100, false);
            amountToDelete -= 100;
          } else {
            await message.channel.bulkDelete(amountToDelete, false);
          }
        }
        break;
      case "inactivate":
        {
          const member = await memberFactory.getByDiscordId(message.mentions.users.first().id);
          await member.inactivate();
          await member.save();
          message.reply("Success!");
        }
        break;
      case "activate":
        {
          const member = await memberFactory.getByDiscordId(message.mentions.users.first().id);
          await member.activate();
          await member.save();
          message.reply("Success!");
        }
        break;
      case "forceaccept":
        const applications = await applicationFactory.getByDiscordId(message.mentions.users.first().id);
        if(applications) await applications[applications.length - 1].acceptGuildMember();
        message.reply("Success");
        break;
      case "cmd":
        let server = args[1];
        const cmd = args.map((arg, i) => i > 1 ? arg : null).filter(x => x).join(" ");
        try {
          message.channel.send(await mc_helpers.sendCmd(cmd.trim(), server));
        } catch(e) {
          message.reply(e.message);
        }
        break;
      default:
        //Paramater not found
        message.channel.send("Sorry, I cant find that paramater");
        break;
    }
  }
};