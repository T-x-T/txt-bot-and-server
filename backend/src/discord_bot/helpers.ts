/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");

//Global var
let client: Discord.Client;
let guild: Discord.Guild;
global.g.emitter.once('discord_bot_ready', (_client: Discord.Client) => {
  client = _client;
  guild = client.guilds.get(global.g.config.discord_bot.guild);
});


export = {
  async getNicknameByID(userID: string) {
    return `${guild.members.get(userID).user.username}#${guild.members.get(userID).user.discriminator}`;
  },

  async sendMessage(message: string, channelID: string) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
      return;
    }

    const channel = guild.channels.get(channelID) as Discord.TextChannel;
    await channel.send(message);
  },

  getSelfAssignableRoles() {
    return guild.roles.map((item) => {
      return item.name.indexOf('#') === 0 ? {id: item.id, name: item.name} : null;
    }).filter(x => x);
  },

  getRoleId(roleName: string) {
    return guild.roles.find(x => x.name === roleName)?.id
  },

  async addMemberToRole(discordID: string, roleID: string) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
      return null;
    }
    return await guild.members.get(discordID).addRoles([roleID]);
  },

  async removeMemberFromRole(discordID: string, roleID: string) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_removeMemberFromRole", discordID, roleID);
      return null;
    }
    return await guild.members.get(discordID).removeRoles([roleID]);
  },

  hasRole(discordID: string, roleToCheck: string) {
    return guild.members.get(discordID).roles.has(roleToCheck);
  },

  isGuildMember(userID: string) {
    return guild.members.has(userID);
  },

  setNickname(discordID: string, newNick: string) {
    guild.members.get(discordID).setNickname(newNick);
  },

  getMemberObjectByID(userID: string) {
    return guild.members.get(userID);
  },

  banMember(userID: string) {
    if(global.g.ENVIRONMENT == 'testing') {
      global.g.emitter.emit('testing_discordhelpers_ban', userID);
      return;
    }
    guild.members.get(userID).ban();
  }
};