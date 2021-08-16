/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
import main = require("./main.js");
import { CustomClient } from "discord.js";

export = {
  async init(config: IConfig, client: CustomClient) {
    client.config = config.discord_bot;
    main(config, client);
  }
}