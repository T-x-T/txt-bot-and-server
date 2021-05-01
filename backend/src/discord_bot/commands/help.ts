/*
 *	COMMAND FILE FOR HELP
 *	List all commands or all arguments for a single command
 */

import Discord = require("discord.js");

export = {
  name: "help",
  description: "List all commands or all arguments for a single command",
  aliases: ["man"],
  usage: "[command name]",

  async execute(message: Discord.Message, args: string[]) {
    const data = [];
    const { commands } = message.client;

    //If the user didnt specify any command, list all commands
    if (!args.length) {
      data.push("**Join here:** https://paxterya.com/join-us");
      data.push("**Survival Server IP:** paxterya.com");
      data.push("**Creative Server IP:** paxterya.com:25566");
      data.push(`**Version:** ${global.g.cache.minecraftServerVersion} java`);
      data.push(`**Help:** <#${message.guild.channels.find(channel => channel.name == "support").id}>`);
      data.push("\nHere is a list of all available commands: ");
      data.push(commands.map(command => command.name).join(", "));
      data.push(`\nYou can send \`${global.g.config.discord_bot.bot_prefix}help [command name]\` to get info on a specific command!`);

      await message.channel.send(data, { split: true });
      return;
    }
    
    const command = commands.get(args[0]) || commands.find(c => c.aliases && c.aliases.includes(args[0]));

    if (!command) {
      message.reply("I actually have no idea which command you mean");
      return;
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(", ")}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${command.usage}`);

    message.channel.send(data, { split: true });
  }
};