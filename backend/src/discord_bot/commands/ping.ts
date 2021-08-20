import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export = {
  data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("It pings"),
  async execute(interaction: CommandInteraction) {
    if(!interaction.isCommand()) return;
    await interaction.reply("pong");
  }
}