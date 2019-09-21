/*
 *  INDEX FILE FOR THE DISCORD BOT
 *  This file is creating the discord bot and it reads in commands from the command sub-folder
 */

//Dependencies
const config = require('./../config.js');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const _data = require('./../lib/data.js');
const discordHelpers = require('./discord-helpers.js');
const log = require('./../lib/log.js');

//Create the container
var discordBot = { };

//Gets called when everything is ok and the bot is logged in
client.once('ready', () => {
    console.log('The Discord bot is ready!');
    client.user.setActivity('your messages',{type: 'LISTENING'});
    //Hand the client object over to discord-helpers.js
    discordHelpers.init(client);
    //Finally log that we sucessfully started
    log.write(1, 'Discord Bot connected sucessfully', null, function (err) {
        if (err) console.log('Error logging event: Discord Bot connected sucessfully');
    });
});

//Gets called when the bot receives a new message
client.on('message', message => {
    //Stop processing the message when it doesnt start with our prefix or if its from another bot
    if (!message.content.startsWith(config["bot-prefix"]) || message.author.bot || message.channel.type === 'dm') return;

    //Split the message into the command name and its arguments
    var args = message.content.slice(config["bot-prefix"].length).split(/ +/);
    var commandName = args.shift().toLowerCase();

    //Convert all arguments to lowerCase
    var tempArgs = [];
    args.forEach((cur) => {
      tempArgs.push(cur.toLowerCase());
    })
    args = tempArgs;

    //Stop processing the message if the command specified cant be found
    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) {
        message.channel.send('I cant find that command :(');
        return;
    }
    //If the specified command is only to be executed in a server, but it was executed in dms, reply an error
    if (command.guildOnly && message.channel.type !== 'text') {
        return message.reply('I cant do that inside a DM ;(');
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
        console.log('Some Discord command just broke: ' + e);
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
        if (reaction.emoji.guild.id == config["guild"]) {
            //Cancel the operation if someones reacts to themself
            if (user.id === reaction.message.author.id) return;
            if (reaction.emoji.name == 'upvote'){
                _data.updateKarma(reaction.message.author.id, 1, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            if (reaction.emoji.name == 'downvote'){
                _data.updateKarma(reaction.message.author.id, -1, function (err) {

                });
            }
        }
    } catch (e) {
        //No need to do anything
    }

});

//Gets called when a reaction gets removed from some message
client.on('messageReactionRemove', (reaction, user) => {
    //The check if the emoji is the emoji from our server will throw an exception if its from another server
    try {
        if (reaction.emoji.guild.id == config["guild"]) {
            //Cancel the operation if someones reacts to themself
            if (user.id === reaction.message.author.id) return;
            if (reaction.emoji.name == 'upvote'){
                _data.updateKarma(reaction.message.author.id, -1, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
            if (reaction.emoji.name == 'downvote'){
                _data.updateKarma(reaction.message.author.id, 1, function (err) {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
    } catch (e) {
        //No need to do anything
    }
});

//Init script
discordBot.init = function () {
    //Read in and require all command files dynamically
    client.commands = new Discord.Collection();
    const commandFiles = fs.readdirSync('./discord-bot/commands').filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.name, command);
    }

    client.login(config["bot-token"]);
};


//Export the container
module.exports = discordBot;
