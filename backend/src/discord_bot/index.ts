/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
import main = require("./main.js");
import Discord = require("discord.js");

export = {
  async init(config: IConfigDiscordBot, client: Discord.Client) {
    client.config = config;
    main(config, client);
  }
}