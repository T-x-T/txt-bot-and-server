/*
*	COMMAND FILE FOR ADMIN COMMANDS
*	Command for all the admin thingys
*/

import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

import ApplicationFactory = require("../../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
applicationFactory.connect(); 

import { CommandInteraction, TextChannel } from "discord.js";
import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandSubcommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import auth = require("../../auth/index.js");

export = {
  data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("contains admin commands")
        .addSubcommand(new SlashCommandSubcommandBuilder()
                        .setName("delete")
                        .setDescription("deletes messages")
                        .addIntegerOption(new SlashCommandIntegerOption()
                                          .setName("count")
                                          .setDescription("the amount of messages to delete")
                                          .setRequired(true)
                        )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
                        .setName("inactivate")
                        .setDescription("inactivates given user")
                        .addUserOption(new SlashCommandUserOption()
                                          .setName("user")
                                          .setDescription("user to inactivate")
                                          .setRequired(true)
                        )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
                        .setName("activate")
                        .setDescription("activates given user")
                        .addUserOption(new SlashCommandUserOption()
                                          .setName("user")
                                          .setDescription("user to activate")
                                          .setRequired(true)
                        )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
                        .setName("forceaccept")
                        .setDescription("force accepts application of given user")
                        .addUserOption(new SlashCommandUserOption()
                                          .setName("user")
                                          .setDescription("user to force accept")
                                          .setRequired(true)
                        )
        ),
  async execute(interaction: CommandInteraction) {
    if(!interaction.isCommand()) return;

    if(auth.getAccessLevelFromDiscordId(interaction.user.id) < 8) {
      return await interaction.reply("Sorry, you are not authorized to do that");
    }

    switch(interaction.options.getSubcommand()) {
      case "delete": {
        const amountToDelete = Math.round(interaction.options.getInteger("count"));

        if(isNaN(amountToDelete)) {
          return await interaction.reply("Thats not a real number");
        }

        if(amountToDelete > 100 || amountToDelete < 1) return await interaction.reply("I can only delete between 1 and 100 messages at once!");
        
        await (interaction.channel as TextChannel).bulkDelete(amountToDelete, false);

        return await interaction.reply("I am done here");
      }
      case "inactivate": {
        await interaction.reply("working on it...");
        const member = await memberFactory.getByDiscordId(interaction.options.getUser("user").id);
        await member.inactivate();
        await member.save();
        return await interaction.editReply("I am done");
      }
      case "activate": {
        await interaction.reply("working on it...");
        const member = await memberFactory.getByDiscordId(interaction.options.getUser("user").id);
        await member.activate();
        await member.save();
        return await interaction.editReply("I am done");
      }
      case "forceaccept": {
        await interaction.reply("working on it...");
        const applications = await applicationFactory.getByDiscordId(interaction.options.getUser("user").id);
        if(applications) await applications[applications.length - 1].acceptGuildMember();
        return await interaction.editReply("I am done");
      }
      default: return;
    }
  }
}