/*
*  INDEX FILE FOR THE DISCORD BOT
*  This file is creating the discord bot and it reads in commands from the command sub-folder
*/

//Dependencies
import fs = require("fs");
import Discord = require("discord.js");
const client = new Discord.Client({restWsBridgeTimeout: 50000, restTimeOffset: 1000});
import discordHelpers = require("../discord_bot/helpers.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import ApplicationFactory = require("../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
applicationFactory.connect();

//Gets called when everything is ok and the bot is logged in
client.once('ready', () => {
  client.user.setActivity('your messages',{type: 'LISTENING'});

  require('./eventListeners.js');
});

//Gets called when the bot receives a new message
client.on('message', message => {
  const prefix: string = global.g.config.discord_bot.bot_prefix;
  //Stop processing the message when it doesnt start with our prefix or if its from another bot
  if (!message.content.startsWith(prefix) || message.author.bot || message.channel.type === 'dm') return;
  if(message.content.startsWith(prefix + "karma")) return;
  
  //Stop processing the message if its empty or just a number
  if(message.content.length <= 2 || Number.isInteger(Number.parseInt(message.content[2]))) return;

  //Split the message into the command name and its arguments
  let args: string[] = message.content.replace(prefix, "").trim().split(" ");
  const commandName = args.shift().toLowerCase();

  //Convert all arguments to lowerCase
  var tempArgs: string[] = [];
  args.forEach((cur) => {
    tempArgs.push(cur.toLowerCase());
  });
  args = tempArgs;

  //Stop processing the message if the command specified cant be found
  const command = (client as any).commands.get(commandName) || (client as any).commands.find((cmd: any) => cmd.aliases && cmd.aliases.includes(commandName)); //TODO: fix any
  if (!command) {
    message.channel.send('I cant find that command :(');
    return;
  }

  //Check if the message contains all arguments needed for the specified command
  if (command.args && !args.length) {
    let reply = `Hey ${message.author}, you didnt provide enough arguments!`;
    //If there is a usage description send that back too
    if (command.usage) {
      reply += `\nTry doing it more like that: \`${prefix}${command.name} ${command.usage}\``;
    }
    message.channel.send(reply);
    return;
  }

  //Call the command
  try {
    command.execute(message, args);
  } catch (e) {
    global.g.log(3, 'discord_bot', 'Some Discord command just broke', { error: e, msg: message.content });
    console.log("Discord command broke:", message.content, e);
    message.reply('There was an oopsie when I tried to do that');
    global.g.emitter.emit('crash', e, 'discord command');
  }
});

//Gets called whenever a member leaves the guild; user is a guildMember
client.on('guildMemberRemove', (user) => {
  memberFactory.getByDiscordId(user.id)
  .then((member: any) => {
    if(member) member.delete()
  });
  discordHelpers.sendMessage(`${user.displayName} left the server`, global.g.config.discord_bot.channel.mod_notifications);
});

//Gets called whenever a member gets banned from the guild; user is a guildMember
client.on('guildBanAdd', (guild, user) => {
  memberFactory.getByDiscordId(user.id)
  .then((member: any) => {member.ban(); console.log('ban')});
  discordHelpers.sendMessage(`${user.username} was banned from the server`, global.g.config.discord_bot.channel.mod_notifications);
});

//Gets called whenever a new member joins the guild
client.on('guildMemberAdd', (user) => {
  //Send a welcome message
  discordHelpers.sendMessage(`Welcome <@${user.id}>! If you are here for joining the Minecraft server, then please read the <#${user.guild.channels.find(channel => channel.name == "faq").id}> and read the rules at https://paxterya.com/rules. You can then apply under https://paxterya.com/join-us\nIf you have any questions just ask in <#${user.guild.channels.find(channel => channel.name == "support").id}>\nWe are looking forward to see you ingame :)`, global.g.config.discord_bot.channel.general, function (err: Error) {
    if(err) global.g.log(2, 'discord_bot', 'discord_bot couldnt send the guildMemberAdd message', { err: err});
  });
  //Check if the new member got accepted as a member
  applicationFactory.getAcceptedByDiscordId(user.id)
  .then((application: any) => {
    if(application){
      application.acceptGuildMember();
    }
  })
  .catch((e: Error) => {
    global.g.log(2, "discord_bot", "guildMemberAdd event handler couldnt get accepted application for user", {err: e.message, user: user.id});
  });
  memberFactory.create(user.id);
});

//Read in and require all command files dynamically
(client as any).commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./discord_bot/commands').filter((file: string) => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  (client as any).commands.set(command.name, command);
}

client.login(global.g.config.discord_bot.bot_token)
  .then(() => {
    console.log('The Discord bot is ready!');
    global.g.log(1, 'discord_bot', 'Discord Bot connected sucessfully', null);
    global.g.emitter.emit('discord_bot_ready', client);
  })
  .catch(e => console.log("Failed to log in with token: ", e));
