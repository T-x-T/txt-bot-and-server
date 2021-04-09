/*
 *  INDEX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
const discord_helpers = require('./helpers');

//Create the container
var index = {};

/*
 *  Functions
 */

index.getNicknameByID     = discord_helpers.getNicknameByID;
index.returnRoles         = discord_helpers.returnRoles;
index.returnRoleId        = discord_helpers.returnRoleId;
index.addMemberToRole     = discord_helpers.addMemberToRole;
index.removeMemberFromRole= discord_helpers.removeMemberFromRole;
index.hasRole             = discord_helpers.hasRole;
index.banMember           = discord_helpers.banMember;
index.isGuildMember       = discord_helpers.isGuildMember;
index.getMemberObjectById = discord_helpers.getMemberObjectByID;
index.sendMessage         = discord_helpers.sendMessage;
index.sendNewApplicationMessage = discord_helpers.sendNewApplicationMessage
index.sendAcceptedMemberWelcomeMessage = discord_helpers.sendAcceptedMemberWelcomeMessage;

//Export the container
module.exports = index;