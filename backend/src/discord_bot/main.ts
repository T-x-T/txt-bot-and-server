/*
*  INDEX FILE FOR THE DISCORD BOT
*  This file is creating the discord bot and it reads in commands from the command sub-folder
*/

//Dependencies
import fs = require("fs");
import Discord = require("discord.js");
import discordHelpers = require("../discord_bot/helpers.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import ApplicationFactory = require("../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
applicationFactory.connect();
import log = require("../log/index.js");

const client = discordHelpers.client;

client.once("ready", () => {
  client.user.setActivity("your messages",{type: "LISTENING"});
});

client.on("message", async message => {
  const prefix: string = global.g.config.discord_bot.bot_prefix;

  //Check if we can disregard the message
  if(
    !message.content.startsWith(prefix)
    || message.author.bot
    || message.channel.type === "dm"
    || message.content.startsWith(prefix + "karma")
    || message.content.length <= 2
    || Number.isInteger(Number.parseInt(message.content[2]))
  ) return;

  //Split the message into the command name and its arguments
  const words: string[] = message.content.replace(prefix, "").trim().split(" ");
  const commandName = words.shift().toLowerCase();
  const args = words.map(word => word.toLowerCase());

  //Stop processing the message if the command specified cant be found
  const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
  if (!command) {
    message.channel.send("I cant find that command :(");
    return;
  }

  //Call the command
  try {
    await command.execute(message, args);
  } catch (e) {
    log.write(3, "discord_bot", "Some Discord command just broke", { error: e.message, msg: message.content });
    console.log("Discord command broke:", message.content, e);
    message.reply("There was an oopsie when I tried to do that");
    discordHelpers.sendCrashMessage(e, "discord command");
  }
});

client.on("guildMemberRemove", async user => {
  try {
    const member = await memberFactory.getByDiscordId(user.id);
    await member.delete();
    discordHelpers.sendMessage(`${user.displayName} left the server`, global.g.config.discord_bot.channel.mod_notifications);
  } catch (e) {
    discordHelpers.sendCrashMessage(e, "discord event handler");
    log.write(3, "discord_bot", "guildMemberRemove failed", {error: e.message, user: user.id});
  }
});

client.on("guildBanAdd", async (guild, user) => {
  try {
    const member = await memberFactory.getByDiscordId(user.id);
    await member.ban();
    discordHelpers.sendMessage(`${user.username} was banned from the server`, global.g.config.discord_bot.channel.mod_notifications);
  } catch (e) {
    discordHelpers.sendCrashMessage(e, "discord event handler");
    log.write(3, "discord_bot", "guildBanAdd failed", {error: e.message, user: user.id});
  }
});

client.on("guildMemberAdd", async user => {
  try {
    discordHelpers.sendMessage(
      `Welcome <@${user.id}>! If you are here for joining the Minecraft server, then please read the <#${user.guild.channels.find(channel => channel.name == "faq").id}> and read the rules at https://paxterya.com/rules. 
      You can then apply under https://paxterya.com/join-us\nIf you have any questions just ask in <#${user.guild.channels.find(channel => channel.name == "support").id}>\nWe are looking forward to see you ingame :)`
      , global.g.config.discord_bot.channel.general
    );

    const application = await applicationFactory.getAcceptedByDiscordId(user.id);
    if(application?.length > 0) await application[0].acceptGuildMember();
  } catch(e) {
    discordHelpers.sendCrashMessage(e, "discord event handler");
    log.write(3, "discord_bot", "guildMemberAdd failed", {error: e.message, user: user.id});
  }
});

client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./discord_bot/commands").filter((file: string) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}