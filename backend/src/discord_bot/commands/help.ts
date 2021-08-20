import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import log = require("../../log/index.js");
import minecraft = require("../../minecraft/index.js");

export = {
  data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Gives you some information about the server"),
  async execute(interaction: CommandInteraction) {
    if(!interaction.isCommand()) return;
    let minecraftVersion = "";
    try {
      minecraftVersion = await minecraft.getServerVersion();
    } catch(e) {
      log.write(0, "help command", "minecraft.getServerVersion() threw", {err: e.message});
    }

    let output = "";
    output += "**Survival Server IP:** paxterya.com\n";
    output += "**Creative Server IP:** creative.paxterya.com\n";
    output += `**Version:** ${minecraftVersion} java\n`;
    output += `**Help:** <#${interaction.guild.channels.cache.find(channel => channel.name == "support").id}>\n`;
    output += `**FAQ:** <#${interaction.guild.channels.cache.find(channel => channel.name == "faq").id}>\n`;
    output += "Check out all commands by typing /";

    const row = new MessageActionRow()
                .addComponents(new MessageButton()
                              .setLabel("Website")
                              .setStyle("LINK")
                              .setURL("https://paxterya.com")
                )
                .addComponents(new MessageButton()
                              .setLabel("Apply here")
                              .setStyle("LINK")
                              .setURL("https://paxterya.com/join-us")
                )
                .addComponents(new MessageButton()
                              .setLabel("Dynmap")
                              .setStyle("LINK")
                              .setURL("https://paxterya.com/dynmap/survival")
                );

    await interaction.reply({content: output, components: [row]});
  }
}