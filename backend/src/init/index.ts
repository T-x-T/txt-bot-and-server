import Discord = require("discord.js");

const init = {
  getEnv(): EEnvironment {
    if(process.env.NODE_ENV == "prod") return EEnvironment.prod;
    if(process.env.NODE_ENV == "testing") return EEnvironment.testing;
    return EEnvironment.staging;
  },

  getConfig(environment: EEnvironment): IConfig {
    return require("../../config.json")[environment];
  },

  async getDiscordClient(config: IConfigDiscordBot): Promise<Discord.Client> {
    const client = new Discord.Client({restWsBridgeTimeout: 50000, restTimeOffset: 1000});
    await client.login(config.bot_token);
    return client;
  }
}

export = init;