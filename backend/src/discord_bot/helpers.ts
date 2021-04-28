/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");

//Global var
let client: Discord.Client;
global.g.emitter.once('discord_bot_ready', (_client: Discord.Client) => {
  client = _client;
});

export = {
  async getNicknameByID(userID: string) {
    return `${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.discriminator}`;
  },

  async sendMessage(message: string, channelID: string) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
      return;
    }

    const channel = client.guilds.get(global.g.config.discord_bot.guild).channels.get(channelID) as Discord.TextChannel;
    await channel.send(message);
  },

  getSelfAssignableRoles() {
    return client.guilds.get(global.g.config.discord_bot.guild).roles.map((item) => {
      return item.name.indexOf('#') === 0 ? {id: item.id, name: item.name} : null;
    }).filter(x => x);
  },

  getRoleId(roleName: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).roles.find(x => x.name === roleName)?.id
  },

  async addMemberToRole(discordID: string, roleID: string) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
      return null;
    }
    return await client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).addRoles([roleID]);
  },

  async removeMemberFromRole(discordID: string, roleID: string) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_discordHelpers_removeMemberFromRole", discordID, roleID);
      return null;
    }
    return await client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).removeRoles([roleID]);
  },

  hasRole(discordID: string, roleToCheck: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).roles.has(roleToCheck);
  },

  isGuildMember(userID: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.has(userID);
  },

  setNickname(discordID: string, newNick: string) {
    client.guilds.get(global.g.config.discord_bot.guild).members.get(discordID).setNickname(newNick);
  },

  getMemberObjectByID(userID: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.get(userID);
  },

  banMember(userID: string) {
    if(global.g.ENVIRONMENT == 'testing') {
      global.g.emitter.emit('testing_discordhelpers_ban', userID);
      return;
    }
    client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).ban();
  }
};