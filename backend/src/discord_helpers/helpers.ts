/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");

let config: IConfigDiscordBot;
let environment: EEnvironment;
let client: Discord.Client;
let guild: Discord.Guild;

const helpers = {
  init(_config: IConfigDiscordBot, _environment: EEnvironment, _client: Discord.Client) {
    config = _config;
    environment = _environment;
    client = _client;
    guild = client.guilds.cache.get(config.guild);
  },

  getNicknameByIdOfGuildUser(userID: string) {
    if(guild.members.cache.get(userID)) return `${guild.members.cache.get(userID).user.username}#${guild.members.cache.get(userID).user.discriminator}`;
    return null;
  },

  async sendCrashMessage(err: Error, origin: string) {
    if(!helpers) return;
    await helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, config.channel.logs);
  },

  async sendMessage(message: string, channelID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
      return;
    }

    const channel = guild.channels.cache.get(channelID) as Discord.TextChannel;
    if(!channel) return console.error("sendMessage tried to send to a channel that doesnt exist");
    await Promise.all(Discord.Util.splitMessage(message).map(msg => channel.send(msg)));
  },

  getSelfAssignableRoles() {
    return guild.roles.cache.map((item) => {
      return item.name.indexOf("#") === 0 ? {id: item.id, name: item.name} : null;
    }).filter(x => x);
  },

  getRoleId(roleName: string) {
    return guild.roles.cache.find(x => x.name === roleName)?.id
  },

  async addMemberToRole(discordID: string, roleID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
      return null;
    }
    return await guild.members.cache.get(discordID).roles.add(roleID);
  },

  async removeMemberFromRole(discordID: string, roleID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordHelpers_removeMemberFromRole", discordID, roleID);
      return null;
    }
    return await guild.members.cache.get(discordID).roles.remove(roleID);
  },

  hasRole(discordID: string, roleToCheck: string) {
    return guild.members.cache.get(discordID).roles.cache.has(roleToCheck);
  },

  isGuildMember(userID: string) {
    return guild.members.cache.has(userID);
  },

  async setNickname(discordID: string, newNick: string) {
    return guild.members.cache.get(discordID).setNickname(newNick);
  },

  getNickname(discordId: string) {
    const user = client.guilds.cache.get(config.guild).members.cache.get(discordId).user
    return `${user.username}#${user.discriminator}`;
  },

  getMemberObjectByID(userID: string) {
    return guild.members.cache.get(userID);
  },

  fetchUser(userId: string) {
    return client.users.fetch(userId);
  },

  banMember(userID: string) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_discordhelpers_ban", userID);
      return;
    }
    guild.members.cache.get(userID).ban();
  },

  async getAvatarUrl(discordId: string) {
    return (await client.users.fetch(discordId)).avatarURL();
  }
};

export = helpers;