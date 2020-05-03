/*
*  INDEX FILE FOR THE DISCORD BOT
*  This file is creating the discord bot and it reads in commands from the command sub-folder
*/

//Dependencies
const fs             = require('fs');
const Discord        = require('discord.js');
const client         = new Discord.Client();
const _user          = require('../user');
const discordHelpers = require('../discord_bot/helpers.js');
const application    = require('../application');

//Create the container
var discordBot = {};

//Gets called when everything is ok and the bot is logged in
client.once('ready', () => {
  emitter.emit('discord_bot_ready', client);
  console.log('The Discord bot is ready!');
  client.user.setActivity('your messages',{type: 'LISTENING'});
  //Finally log that we sucessfully started
  global.log(1, 'discord_bot', 'Discord Bot connected sucessfully', null);
});

emitter.on('discord_bot_ready' ,() => {
  //Gets called when the bot receives a new message
  client.on('message', message => {
    //Stop processing the message when it doesnt start with our prefix or if its from another bot
    if (!message.content.startsWith(config.discord_bot.bot_prefix) || message.author.bot || message.channel.type === 'dm') return;

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
    }
  });

  //Gets called when something happens - this is necessary, so we can listen for reactions on non cached (old) messages
  const events = {
    MESSAGE_REACTION_ADD: 'messageReactionAdd',
    MESSAGE_REACTION_REMOVE: 'messageReactionRemove'
  };
  client.on('raw', async event => {
    if (!events.hasOwnProperty(event.t)) return;

    const { d: data } = event;
    const user = client.users.get(data.user_id);
    const channel = client.channels.get(data.channel_id) || await user.createDM();

    if (channel.messages.has(data.message_id)) return;

    const message = await channel.fetchMessage(data.message_id);
    const emojiKey = (data.emoji.id) ? `${data.emoji.name}:${data.emoji.id}` : data.emoji.name;
    const reaction = message.reactions.get(emojiKey);
    client.emit(events[event.t], reaction, user);
    //if (message.reactions.size === 1) message.reactions.delete(emojiKey);
  });

  //Gets called when a reaction gets added to some message
  client.on('messageReactionAdd', (reaction, user) => {
    //The check if the emoji is the emoji from our server will throw an exception if its from another server
    try {
      if (reaction.emoji.guild.id == config.discord_bot.guild) {
        //Cancel the operation if someones reacts to themself
        if (user.id === reaction.message.author.id) return;
        if (reaction.emoji.name == 'upvote') {
          _user.modify({ discord: reaction.message.author.id }, 'karma', 1, false, function (err, doc) { });
        }
        if (reaction.emoji.name == 'downvote') {
          _user.modify({ discord: reaction.message.author.id }, 'karma', -1, false, function (err, doc) { });
        }
      }
    } catch (e) { }
  });

  //Gets called when a reaction gets removed from some message
  client.on('messageReactionRemove', (reaction, user) => {
    //The check if the emoji is the emoji from our server will throw an exception if its from another server
    try {
      if (reaction.emoji.guild.id == config.discord_bot.guild) {
        //Cancel the operation if someones reacts to themself
        if (user.id === reaction.message.author.id) return;
        if (reaction.emoji.name == 'upvote') {
          _user.modify({ discord: reaction.message.author.id }, 'karma', -1, false, function (err, doc) { });
        }
        if (reaction.emoji.name == 'downvote') {
          _user.modify({ discord: reaction.message.author.id }, 'karma', 1, false, function (err, doc) { });
        }
      }
    } catch (e) { }
  });

  //Gets called whenever a member leaves the guild; user is a guildMember
  client.on('guildMemberRemove', (user) => {
    user.get({discord: user.id}, {onlyPaxterians: false, first: true}, function(err, doc){
      emitter.emit('user_left', user, doc);
    });
    discordHelpers.sendMessage(`${user.displayName} left the server`, config.discord_bot.channel.new_application_announcement, function (e) { });
  });

  //Gets called whenever a member gets banned from the guild; user is a guildMember
  client.on('guildBanAdd', (guild, user) => {
    user.get({discord: user.id}, {onlyPaxterians: false, first: true}, function(err, doc){
      emitter.emit('user_banned', user, doc);
    });
    discordHelpers.sendMessage(`${user.username} was banned from the server`, config.discord_bot.channel.new_application_announcement, function (e) { });
  });

  //Gets called whenever a new member joins the guild
  client.on('guildMemberAdd', (user) => {
    //Send a welcome message
    discordHelpers.sendMessage(`Welcome <@${user.id}>! If you are here for joining the Minecraft server, then please apply under https://paxterya.com/join-us, read the rules at https://paxterya.com/rules and consult our FAQ at https://paxterya.com/faq \nIf you have any questions just ping the admins (they like getting pinged, trust me)`, config.discord_bot.channel.general, function (err) {
      if (err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', { err: err, application: doc });
    });
    //Check if the new member got accepted as a member
    application.get({ discord_id: user.id }, { first: true }, function (err, doc) {
      if(doc){
        if (doc.status == 3) application.acceptWorkflow(user.id);
      }
    });
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
