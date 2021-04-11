/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");

//Global var
var client: Discord.Client;
global.g.emitter.once('discord_bot_ready', (_client) => {
  client = _client;
});

const helpers = {
  sendNewApplicationMessage(application) {
    helpers.sendMessage('New application from ' + application.getMcIgn() + '\nYou can find it here: https://paxterya.com/interface', global.g.config.discord_bot.channel.new_application_announcement, function (err) {
      if(err) global.g.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', {err: err, application: application});
    });
  },

  sendAcceptedMemberWelcomeMessage(application) {
    let msg = '';
    if(application.getPublishAboutMe()) msg = `Welcome <@${application.getDiscordId()}> to Paxterya!\nHere is the about me text they sent us:\n${application.getAboutMe()}`;
    else msg = `Welcome <@${application.getDiscordId()}> to Paxterya!`;
    msg += '\n\nThis means you can now join the server! If you have any troubles please ping the admins!\n';
    msg += 'It is also a good time to give our rules a read: https://paxterya.com/rules\n';
    msg += `Please also take a look at our FAQ: <#624992850764890122>\n`;
    msg += 'The IP of the survival server is paxterya.com and the IP for the creative Server is paxterya.com:25566\n\n';
    msg += 'If you encounter any issues or have any questions, feel free to contact our staff.'
    helpers.sendMessage(msg, global.g.config.discord_bot.channel.new_member_announcement, function (err) {
      if(err) global.g.log(2, 'discord_bot', 'discord_bot couldnt send the welcome message', {err: err, application: application});
    });
  },

  //Get the nickname of user by their id
  getNicknameByID(userID, callback) {
    try {
      callback(`${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.discriminator}`);
    } catch(e) {
      callback(false);
    }
  },

  //Sends a given message in a given channel
  sendMessage(message, channelID, callback) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
      callback(false);
      return;
    }

    let curChannel = client.guilds.get(global.g.config.discord_bot.guild).channels.get(channelID) as Discord.TextChannel;
    curChannel.send(message)
      .then(message => {
        callback(false);
      })
      .catch(e => {
        callback(e);
      });
  },

  //Returns all roles from the guild defined in global.g.config.js
  //Returns only roles that members are allowed to join/leave themselves!
  returnRoles() {
    let roles = [];
    client.guilds.get(global.g.config.discord_bot.guild).roles.map(function (item) {
      if(item.name.indexOf('#') > -1) roles.push({id: item.id, name: item.name});
    });
    return roles;
  },

  //Returns the role ID of a role by name
  returnRoleId(roleName) {
    let id: any = -1;
    client.guilds.get(global.g.config.discord_bot.guild).roles.map(function (item) {
      if(item.name == roleName) id = item.id;
    });
    return id;
  },

  //Adds the given discord member to the given role
  addMemberToRole(discordID, roleID, callback) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
      callback(false);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).addRoles([roleID])
      .then(() => callback(false))
      .catch(e => callback(e));
  },

  removeMemberFromRole(discordID, roleID, callback) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_removeMemberFromRole", discordID, roleID);
      callback(false);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).removeRoles([roleID])
      .then(() => callback(false))
      .catch(e => callback(e));
  },

  hasRole(discordID, roleToCheck) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).roles.has(roleToCheck);
  },

  //Returns true if the given discord id is member of the guild and false if not
  isGuildMember(userID) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.has(userID);
  },

  setNickname(discordID, newNick) {
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).setNickname(newNick);
  },

  getMemberObjectByID(userID, callback) {
    try {
      callback(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID));
    } catch(e) {
      callback(false);
    }
  },

  banMember(userID) {
    if(global.g.ENVIRONMENT == 'testing') {
      global.g.emitter.emit('testing_discordhelpers_ban', userID);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).ban();
  },

  //Init script, needs to be called from discord_bot.js, so we can use the client object here
  init(origClient) {
    client = origClient;
  },
};

module.exports = helpers;

export default {}