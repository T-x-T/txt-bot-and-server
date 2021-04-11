/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
const discord_helpers = require("./helpers.js");

module.exports = {
  getNicknameByID: discord_helpers.getNicknameByID,
  returnRoles: discord_helpers.returnRoles,
  returnRoleId: discord_helpers.returnRoleId,
  addMemberToRole: discord_helpers.addMemberToRole,
  removeMemberFromRole: discord_helpers.removeMemberFromRole,
  hasRole: discord_helpers.hasRole,
  banMember: discord_helpers.banMember,
  isGuildMember: discord_helpers.isGuildMember,
  getMemberObjectById: discord_helpers.getMemberObjectByID,
  sendMessage: discord_helpers.sendMessage,
  sendNewApplicationMessage: discord_helpers.sendNewApplicationMessage,
  sendAcceptedMemberWelcomeMessage: discord_helpers.sendAcceptedMemberWelcomeMessage,
}

export default {}