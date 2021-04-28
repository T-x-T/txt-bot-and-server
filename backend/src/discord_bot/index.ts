/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
import discord_helpers = require("./helpers.js");

export = {
  getNicknameByID: discord_helpers.getNicknameByID,
  getSelfAssignableRoles: discord_helpers.getSelfAssignableRoles,
  getRoleId: discord_helpers.getRoleId,
  addMemberToRole: discord_helpers.addMemberToRole,
  removeMemberFromRole: discord_helpers.removeMemberFromRole,
  hasRole: discord_helpers.hasRole,
  banMember: discord_helpers.banMember,
  isGuildMember: discord_helpers.isGuildMember,
  getMemberObjectById: discord_helpers.getMemberObjectByID,
  sendMessage: discord_helpers.sendMessage,
}