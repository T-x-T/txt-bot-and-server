/*
 *	COMMAND FILE FOR HELP
 *	List all commands or all arguments for a single command
 */

module.exports = {
  name: 'help',
  description: 'List all commands or all arguments for a single command',
  aliases: ['man'],
  usage: '[command name]',

  execute(message, args) {
    const data = [];
    const { commands } = message.client;

    //If the user didnt specify any command, list all commands
    if (!args.length) {
      data.push('Here is a list of all available commands: ');
      data.push(commands.map(command => command.name).join(', '));
      data.push(`\nYou can send \`${config.discord_bot.bot_prefix}help [command name]\` to get info on a specific command!`);

      return message.channel.send(data, { split: true });
    }
    //Get the command name
    const name = args[0];
    const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

    //Check if the command actually exists
    if (!command) {
      return message.reply('I actually have no idea which command you mean');
    }

    data.push(`**Name:** ${command.name}`);

    if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
    if (command.description) data.push(`**Description:** ${command.description}`);
    if (command.usage) data.push(`**Usage:** ${command.usage}`);

    message.channel.send(data, { split: true });
  }
};
