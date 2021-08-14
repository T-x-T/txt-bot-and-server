import { Client, CustomClient, Intents } from "discord.js";

const init = {
  getEnv(): EEnvironment {
    if(process.env.NODE_ENV == "prod") return EEnvironment.prod;
    if(process.env.NODE_ENV == "testing") return EEnvironment.testing;
    return EEnvironment.staging;
  },

  getConfig(environment: EEnvironment): IConfig {
    return require("../../config.json")[environment];
  },

  async getDiscordClient(config: IConfigDiscordBot): Promise<CustomClient> {
    const client = new Client({restWsBridgeTimeout: 50000, restTimeOffset: 1000, intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_MESSAGES]});
    await client.login(config.bot_token);
    return client as CustomClient;
  }
}

export = init;