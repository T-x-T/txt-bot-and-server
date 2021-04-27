/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");
import Application = require("../application/application.js");

//Global var
let client: Discord.Client;
global.g.emitter.once('discord_bot_ready', (_client: Discord.Client) => {
  client = _client;
});

const helpers = {
  sendNewApplicationMessage(application: Application) {
    helpers.sendMessage('New application from ' + application.getMcIgn() + '\nYou can find it here: https://paxterya.com/interface', global.g.config.discord_bot.channel.new_application_announcement, function (err: Error) {
      if(err) global.g.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', {err: err.message, application: application});
    });
  },

  sendAcceptedMemberWelcomeMessage(application: Application) {
    let msg = '';
    if(application.getPublishAboutMe()) msg = `Welcome <@${application.getDiscordId()}> to Paxterya!\nHere is the about me text they sent us:\n${application.getAboutMe()}`;
    else msg = `Welcome <@${application.getDiscordId()}> to Paxterya!`;
    msg += '\n\nThis means you can now join the server! If you have any troubles please ping the admins!\n';
    msg += 'It is also a good time to give our rules a read: https://paxterya.com/rules\n';
    msg += `Please also take a look at our FAQ: <#624992850764890122>\n`;
    msg += 'The IP of the survival server is paxterya.com and the IP for the creative Server is paxterya.com:25566\n\n';
    msg += 'If you encounter any issues or have any questions, feel free to contact our staff.'
    helpers.sendMessage(msg, global.g.config.discord_bot.channel.new_member_announcement, function (err: Error) {
      if(err) global.g.log(2, 'discord_bot', 'discord_bot couldnt send the welcome message', {err: err.message, application: application});
    });
  },

  //Get the nickname of user by their id
  getNicknameByID(userID: string, callback: Function) {
    try {
      callback(`${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.discriminator}`);
    } catch(e) {
      callback(false);
    }
  },

  //Sends a given message in a given channel
  sendMessage(message: string, channelID: string, callback?: Function) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
      if(callback) callback(false);
      return;
    }

    let curChannel = client.guilds.get(global.g.config.discord_bot.guild).channels.get(channelID) as Discord.TextChannel;
    curChannel.send(message)
      .then(() => {
        if(callback) callback(false);
      })
      .catch(e => {
        if(callback) callback(e);
      });
  },

  //Returns only roles that members are allowed to join/leave themselves!
  returnRoles() {
    let roles: {id: string, name: string}[] = [];
    client.guilds.get(global.g.config.discord_bot.guild).roles.map((item) => {
      if(item.name.indexOf('#') === 0) roles.push({id: item.id, name: item.name});
    });
    return roles;
  },

  //Returns the role ID of a role by name
  returnRoleId(roleName: string) {
    let id: any = -1;
    client.guilds.get(global.g.config.discord_bot.guild).roles.map(function (item) {
      if(item.name == roleName) id = item.id;
    });
    return id;
  },

  //Adds the given discord member to the given role
  addMemberToRole(discordID: string, roleID: string, callback: Function) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
      callback(false);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).addRoles([roleID])
      .then(() => callback(false))
      .catch(e => callback(e));
  },

  removeMemberFromRole(discordID: string, roleID: string, callback: Function) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_removeMemberFromRole", discordID, roleID);
      callback(false);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).removeRoles([roleID])
      .then(() => callback(false))
      .catch(e => callback(e));
  },

  hasRole(discordID: string, roleToCheck: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).roles.has(roleToCheck);
  },

  //Returns true if the given discord id is member of the guild and false if not
  isGuildMember(userID: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.has(userID);
  },

  setNickname(discordID: string, newNick: string) {
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).setNickname(newNick);
  },

  getMemberObjectByID(userID: string, callback: Function) {
    try {
      callback(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID));
    } catch(e) {
      callback(false);
    }
  },

  banMember(userID: string) {
    if(global.g.ENVIRONMENT == 'testing') {
      global.g.emitter.emit('testing_discordhelpers_ban', userID);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).ban();
  }
};

export = helpers;