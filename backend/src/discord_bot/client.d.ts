import { Client } from "discord.js";

declare module "discord.js" {
  export interface CustomClient extends Client {
    commands: Collection<unknown, any>,
    config: IConfigDiscordBot
  }
}
