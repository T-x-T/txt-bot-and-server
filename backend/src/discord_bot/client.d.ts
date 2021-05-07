declare module "discord.js" {
  export interface Client {
    commands: Collection<unknown, any>,
    config: IConfigDiscordBot
  }
}
