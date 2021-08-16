import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export = {
  data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("It pings"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("pong");
  }
}