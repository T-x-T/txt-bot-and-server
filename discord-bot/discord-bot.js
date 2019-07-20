/*
 *  INDEX FILE FOR THE DISCORD BOT
 *  This file is creating the discord bot and it reads in commands from the command sub-folder
 */

//Dependencies
const config = require('./../config.js');
const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

//Create the container
var discordBot = { };

//Gets called when everything is ok and the bot is logged in
client.once('ready', () => {
    console.log('The Discord bot is ready!');
});

//Gets called when the bot receives a new message
client.on('message', message => {
    //Stop processing the message when it doesnt start with our prefix or if its from another bot
    if (!message.content.startsWith(config["bot-prefix"]) || message.author.bot) return;

    //Split the message into the command name and its arguments
    const args = message.content.slice(config["bot-prefix"].length).split(/ +/);
    const commandName = args.shift().toLowerCase();

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