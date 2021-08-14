/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
import main = require("./main.js");
import { CustomClient } from "discord.js";

export = {
  async init(config: IConfigDiscordBot, client: CustomClient) {
    client.config = config;
    main(config, client);
  }
}