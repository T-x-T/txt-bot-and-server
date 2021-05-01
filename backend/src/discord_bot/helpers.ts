/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

import Discord = require("discord.js");

//Global var
const client = new Discord.Client({restWsBridgeTimeout: 50000, restTimeOffset: 1000});
let guild: Discord.Guild;

client.login(global.g.config.discord_bot.bot_token)
  .then(() => {
    console.log('The Discord helpers are ready!');
    global.g.log(1, 'discord_bot', 'Discord helpers connected sucessfully', null);
    guild = client.guilds.get(global.g.config.discord_bot.guild);
  })
  .catch(e => console.log("Failed to log in with token: ", e));



const helpers = {
  client: client,

  async getNicknameByID(userID: string) {
    return `${guild.members.get(userID).user.username}#${guild.members.get(userID).user.discriminator}`;
  },

  sendCrashMessage(err: Error, origin: string) {
    helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, global.g.config.discord_bot.channel.logs);
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

  getNickname(discordId: string) {
    return `${client.guilds.get(global.g.config.discord_bot.guild).members.get(discordId).user.username}#${client.guilds.get(global.g.config.discord_bot.guild).members.get(discordId).user.discriminator}`;
  },

  getMemberObjectByID(userID: string) {
    return guild.members.get(userID);
  },

  fetchUser(userId: string) {
    return client.fetchUser(userId);
  },

  banMember(userID: string) {
    if(global.g.ENVIRONMENT == 'testing') {
      global.g.emitter.emit('testing_discordhelpers_ban', userID);
      return;
    }
    guild.members.get(userID).ban();
  },

  async getAvatarUrl(discordId: string) {
    return (await client.fetchUser(discordId)).avatarURL;
  }
};

export = helpers;