/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
import { CustomClient } from "discord.js";
import helpers = require("./helpers.js");

export = {
  getNicknameByIdOfGuildUser: helpers.getNicknameByIdOfGuildUser,
  getSelfAssignableRoles: helpers.getSelfAssignableRoles,
  getRoleId: helpers.getRoleId,
  addMemberToRole: helpers.addMemberToRole,
  removeMemberFromRole: helpers.removeMemberFromRole,
  hasRole: helpers.hasRole,
  banMember: helpers.banMember,
  isGuildMember: helpers.isGuildMember,
  getMemberObjectById: helpers.getMemberObjectByID,
  sendMessage: helpers.sendMessage,
  sendCrashMessage: helpers.sendCrashMessage,
  fetchUser: helpers.fetchUser,
  getNickname: helpers.getNickname,
  getAvatarUrl: helpers.getAvatarUrl,
  setNickname: helpers.setNickname,

  async init(config: IConfigDiscordBot, environment: EEnvironment, client: CustomClient) {
    client.config = config;
    helpers.init(config, environment, client);
  }
}