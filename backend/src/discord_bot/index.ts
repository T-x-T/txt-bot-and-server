/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
import discordHelpers = require("./helpers.js");

export = {
  client: discordHelpers.client,
  getNicknameByID: discordHelpers.getNicknameByID,
  getSelfAssignableRoles: discordHelpers.getSelfAssignableRoles,
  getRoleId: discordHelpers.getRoleId,
  addMemberToRole: discordHelpers.addMemberToRole,
  removeMemberFromRole: discordHelpers.removeMemberFromRole,
  hasRole: discordHelpers.hasRole,
  banMember: discordHelpers.banMember,
  isGuildMember: discordHelpers.isGuildMember,
  getMemberObjectById: discordHelpers.getMemberObjectByID,
  sendMessage: discordHelpers.sendMessage,
  sendCrashMessage: discordHelpers.sendCrashMessage,
  fetchUser: discordHelpers.fetchUser,
  getNickname: discordHelpers.getNickname,
  getAvatarUrl: discordHelpers.getAvatarUrl
}