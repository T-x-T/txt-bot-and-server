/*
*  INDEX FILE FOR THE DISCORD BOT
*  This file is creating the discord bot and it reads in commands from the command sub-folder
*/

//Dependencies
const fs             = require('fs');
const Discord        = require('discord.js');
const client         = new Discord.Client({restWsBridgeTimeout: 50000, restTimeOffset: 1000});
const discordHelpers = require('../discord_bot/helpers.js');
const MemberFactory  = require('../user/memberFactory.js');
const memberFactory  = new MemberFactory();
memberFactory.connect();
const ApplicationFactory = require("../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
applicationFactory.connect();

//Create the container
var discordBot = {};

//Gets called when everything is ok and the bot is logged in
client.once('ready', () => {
  emitter.emit('discord_bot_ready', client);
  console.log('The Discord bot is ready!');
  client.user.setActivity('your messages',{type: 'LISTENING'});
  //Finally log that we sucessfully started
  global.log(1, 'discord_bot', 'Discord Bot connected sucessfully', null);

  const eventListeners = require('./eventListeners.js');
});

emitter.on('discord_bot_ready' ,() => {
  //Gets called when the bot receives a new message
  client.on('message', message => {
    //Stop processing the message when it doesnt start with our prefix or if its from another bot
    if (!message.content.startsWith(config.discord_bot.bot_prefix) || message.author.bot || message.channel.type === 'dm') return;
    if(message.content.startsWith(config.discord_bot.bot_prefix + "karma")) return;
    
    //Stop processing the message if its empty or just a number
    if(message.content.length <= 2 || Number.isInteger(Number.parseInt(message.content[2]))) return;

    //Split the message into the command name and its arguments
    var args = message.content.slice(config.discord_bot.bot_prefix.length).split(/ +/);
    var commandName = args.shift().toLowerCase();

    //Convert all arguments to lowerCase
    var tempArgs = [];
    args.forEach((cur) => {
      tempArgs.push(cur.toLowerCase());
    });
    args = tempArgs;

    //Stop processing the message if the command specified cant be found
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
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
      return message.channel.send(reply);
    }

    //Call the command
    try {
      command.execute(message, args);
    } catch (e) {
      global.log(3, 'discord_bot', 'Some Discord command just broke', { error: e, msg: message.content });
      message.reply('There was an oopsie when I tried to do that');
      emitter.emit('crash', e, 'discord command');
    }
  });

  //Gets called whenever a member leaves the guild; user is a guildMember
  client.on('guildMemberRemove', (user) => {
    memberFactory.getByDiscordId(user.id)
    .then(member => member.delete());
    discordHelpers.sendMessage(`${user.displayName} left the server`, config.discord_bot.channel.mod_notifications, function (e) { });
  });

  //Gets called whenever a member gets banned from the guild; user is a guildMember
  client.on('guildBanAdd', (guild, user) => {
    memberFactory.getByDiscordId(user.id)
    .then(member => {member.ban(); console.log('ban')});
    discordHelpers.sendMessage(`${user.username} was banned from the server`, config.discord_bot.channel.mod_notifications, function (e) {});
  });

  //Gets called whenever a new member joins the guild
  client.on('guildMemberAdd', (user) => {
    //Send a welcome message
    discordHelpers.sendMessage(`Welcome <@${user.id}>! If you are here for joining the Minecraft server, then please apply under https://paxterya.com/join-us, read the rules at https://paxterya.com/rules and consult our FAQ at https://paxterya.com/faq \nIf you have any questions just ask in <#${user.guild.channels.find(channel => channel.name == "support").id}>`, config.discord_bot.channel.general, function (err) {
      if (err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', { err: err, application: doc });
    });
    //Check if the new member got accepted as a member
    applicationFactory.getAcceptedByDiscordId(user.id)
    .then(application => {
      if(application){
        application.acceptGuildMember();
      }
    })
    .catch(e => {
      global.log(2, "discord_bot", "guildMemberAdd event handler couldnt get accepted application for user", {err: e.message, user: user.id});
    });
    memberFactory.create(user.id);
  });
});

//Read in and require all command files dynamically
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./src/discord_bot/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.login(config.discord_bot.bot_token);


//Export the container
module.exports = discordBot;
