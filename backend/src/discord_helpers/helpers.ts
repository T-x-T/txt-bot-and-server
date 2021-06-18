/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");
import log = require("../log/index.js");

let config: IConfigDiscordBot;
let environment: EEnvironment;
let client: Discord.Client;
let guild: Discord.Guild;

const helpers = {
  init(_config: IConfigDiscordBot, _environment: EEnvironment, _client: Discord.Client) {
    config = _config;
    environment = _environment;
    client = _client;
    guild = client.guilds.get(config.guild);
  },

  getNicknameByIdOfGuildUser(userID: string) {
    if(guild.members.get(userID)) return `${guild.members.get(userID).user.username}#${guild.members.get(userID).user.discriminator}`;
    return null;
  },

  sendCrashMessage(err: Error, origin: string) {
    helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, config.channel.logs);
  },

  async sendMessage(message: string, channelID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
      return;
    }

    const channel = guild.channels.get(channelID) as Discord.TextChannel;
    await channel.send(message, {split: true});
  },

  getSelfAssignableRoles() {
    return guild.roles.map((item) => {
      return item.name.indexOf("#") === 0 ? {id: item.id, name: item.name} : null;
    }).filter(x => x);
  },

  getRoleId(roleName: string) {
    return guild.roles.find(x => x.name === roleName)?.id
  },

  async addMemberToRole(discordID: string, roleID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
      return null;
    }
    return await guild.members.get(discordID).addRoles([roleID]);
  },

  async removeMemberFromRole(discordID: string, roleID: string) {
    if(environment == EEnvironment.testing) {
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

  async setNickname(discordID: string, newNick: string) {
    return guild.members.get(discordID).setNickname(newNick);
  },

  getNickname(discordId: string) {
    return `${client.guilds.get(config.guild).members.get(discordId).user.username}#${client.guilds.get(config.guild).members.get(discordId).user.discriminator}`;
  },

  getMemberObjectByID(userID: string) {
    return guild.members.get(userID);
  },

  fetchUser(userId: string) {
    return client.fetchUser(userId);
  },

  banMember(userID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordhelpers_ban", userID);
      return;
    }
    guild.members.get(userID).ban();
  },

  async getAvatarUrl(discordId: string) {
    return (await client.fetchUser(discordId)).avatarURL;
  }
};

export = helpers;