import discordHelpers = require("../../discord_helpers/index.js");
import { CommandInteraction } from "discord.js";
import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder } from "@discordjs/builders";

export = {
  data: new SlashCommandBuilder()
        .setName("role")
        .setDescription("Used to add/remove/list self assignable roles")
        .addSubcommand(new SlashCommandSubcommandBuilder()
                      .setName("list")
                      .setDescription("Lists your roles and all existing ones")
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
                      .setName("add")
                      .setDescription("Assigns you to the given role")
                      .addStringOption(new SlashCommandStringOption()
                                      .setName("role")
                                      .setDescription("the role to add")
                                      .setRequired(true)
                                      .addChoices(discordHelpers.getSelfAssignableRoles().map(x => [x.name.replace("#", ""), x.name]))
                      )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
                      .setName("remove")
                      .setDescription("Removes you from the given role")
                      .addStringOption(new SlashCommandStringOption()
                                      .setName("role")
                                      .setDescription("the role to remove")
                                      .setRequired(true)
                                      .addChoices(discordHelpers.getSelfAssignableRoles().map(x => [x.name.replace("#", ""), x.name]))
                      )
        ),
  async execute(interaction: CommandInteraction) {
    if(!interaction.isCommand) return;

    switch(interaction.options.getSubcommand()) {
      case "add": {
        if (discordHelpers.hasRole(interaction.user.id, discordHelpers.getRoleId(interaction.options.getString("role")))) {
          interaction.reply("You already have that role...");
          break;
        }
        await discordHelpers.addMemberToRole(interaction.user.id, discordHelpers.getRoleId(interaction.options.getString("role")));
        return await interaction.reply(`Welcome in the ${interaction.options.getString("role").replace("#", "")} role!`);
      }
      case "remove": {
        if (!discordHelpers.hasRole(interaction.user.id, discordHelpers.getRoleId(interaction.options.getString("role")))) {
          interaction.reply("You don't have that role anyways...");
          break;
        }
        await discordHelpers.removeMemberFromRole(interaction.user.id, discordHelpers.getRoleId(interaction.options.getString("role")));
        return await interaction.reply(`Youre no longer in the ${interaction.options.getString("role").replace("#", "")} role!`);
      }
      case "list": {
        let output = "```\n";

        output += "Available roles:\n"
        discordHelpers.getSelfAssignableRoles().forEach((item) => {
          output += item.name[0] == "#"? item.name.slice(1) : item.name;
          output += "\n";
        });

        output += "\n\nYour roles: \n"
        let roleCount = 0;
        interaction.guild.members.cache.get(interaction.user.id).roles.cache.map(function(item){
          if(item.name.indexOf("#") > -1){
            output += item.name.slice(1);
            output += "\n";
            roleCount++;
          }
        });
        if(roleCount == 0) output += `There are none, get started by typing /role add <Role-Name>`

        output += "```";
        return await interaction.reply(output);
      }
      default: {
        return await interaction.reply("Congratulations! You managed to use an invalid sub-command. I dont even know how this is possible...");
      }
    }
  }
}