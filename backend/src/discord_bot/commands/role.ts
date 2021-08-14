/*
*	COMMAND FILE FOR ROLES
*	With this command users can manage their role membership for certain roles
*/

import discordHelpers = require("../../discord_helpers/index.js");
import { CustomClient, Message } from "discord.js";

export = {
  name: "role",
  description: "Used to change roles",
  aliases: ["roles"],
  usage: "add ROLE_NAME OR remove ROLE_NAME OR list\n+role add upload\n+role list",
  async execute(message: Message, args: string[]) {

    //Check if the user want to add, remove or list roles
    switch(args[0]){
      case "add":
        //Check if the supplied role exists
        let valid = false;
        discordHelpers.getSelfAssignableRoles().forEach(item => {
          if(item.name == "#" + args[1]) valid = true;
        });
        if(valid){
          await message.member.roles.add(discordHelpers.getRoleId("#" + args[1]));
          message.reply(`Welcome in the ${args[1]} role!`);
        }else{
          message.reply("That role doesnt exist :(")
        }
        break;
      case "remove":
        const roleId = discordHelpers.getRoleId("#" + args[1]);
        if (!discordHelpers.hasRole(message.member.id, roleId)) {
          message.reply("You don't have that role anyways...");
          break;
        }

        message.member.roles.cache.forEach(async role => {
          if(role.id.indexOf(roleId) > -1){
            await message.member.roles.remove(roleId);
            message.reply("Success!");
          }
        });
        break;
      case "list":
        let output = "```\n";

        //Print all available roles
        output += "Available roles:\n"
        discordHelpers.getSelfAssignableRoles().forEach((item) => {
          output += item.name[0] == "#"? item.name.slice(1) : item.name;
          output += "\n";
        });

        //Print all roles of the user
        output += "\n\nYour roles: \n"
        let roleCount = 0;
        message.member.roles.cache.map(function(item){
          if(item.name.indexOf("#") > -1){
            output += item.name.slice(1);
            output += "\n";
            roleCount++;
          }
        });
        if(roleCount == 0) output += `There are none, get started by typing ${(message.client as CustomClient).config.bot_prefix}role add <Role-Name>`

        //Finalize the output and send it
        output += "```";
        message.channel.send(output);
        break;
      default:
        message.channel.send("I couldnt understand you :(\nPlease use add, remove or list");
        break;
    }
  }
};