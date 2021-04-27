/*
 *	COMMAND FILE FOR PING
 *	Test command to see if the bot is working
 */

import Discord = require("discord.js");

export = {
  name: 'ping',
  description: 'It pings',
  aliases: ['ping!', 'pong'],
  execute(message: Discord.Message, _args: string[]) {
    message.channel.send('Pong.');
  }
};