/*
 *  INDX FILE FOR DISCORD_BOT COMPONENT
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
index.updateAllNicks      = discord_helpers.updateAllNicks;
index.updateNicks         = discord_helpers.updateAllDiscordNicks;
index.hasRole             = discord_helpers.hasRole;
index.banMember           = discord_helpers.banMember;

//Export the container
module.exports = index;