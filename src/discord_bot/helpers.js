/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

//Global var
var client;
emitter.on('discord_bot_ready', (_client) => {
  client = _client;
});

//Create the container
var helpers = {};

//Get the nickname of user by their id
helpers.getNicknameByID = function (userID, callback) {
  try {
    callback(`${client.guilds.get(config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(config.discord_bot.guild).members.get(userID).user.discriminator}`);
  } catch (e) {
    callback(false);
  }
};

//Sends a given message in a given channel
helpers.sendMessage = function (message, channelID, callback) {
  let curChannel = client.guilds.get(config.discord_bot.guild).channels.get(channelID);
  curChannel.send(message)
    .then(message => {
      callback(false);
    })
    .catch(e => {
      callback(e);
    });
};

//Returns all roles from the guild defined in config.js
//Returns only roles that members are allowed to join/leave themselves!
helpers.returnRoles = function(){
  let roles = [];
  client.guilds.get(config.discord_bot.guild).roles.map(function(item){
    if(item.name.indexOf('#') > -1) roles.push({id: item.id, name: item.name});
  });
  return roles;
};

//Returns the role ID of a role by name
helpers.returnRoleId = function(roleName){
  let id = -1;
  client.guilds.get(config.discord_bot.guild).roles.map(function(item){
    if(item.name == roleName) id = item.id;
  });
  return id;
};

//Adds the given discord member to the given role
helpers.addMemberToRole = function(discordID, roleID, callback){
  client.guilds.get(config.discord_bot.guild).members.get(discordID).addRole(roleID)
  .then(() => callback(false))
  .catch(e => callback(e));
};

helpers.removeMemberFromRole = function(discordID, roleID, callback){
  client.guilds.get(config.discord_bot.guild).members.get(discordID).removeRole(roleID)
    .then(() => callback(false))
    .catch(e => callback(e));
};

helpers.hasRole = function(discordID, roleToCheck){
  return client.guilds.get(config.discord_bot.guild).members.get(discordID).roles.has(roleToCheck);
};

//Returns true if the given discord id is member of the guild and false if not
helpers.isGuildMember = function(userID){
  return client.guilds.get(config.discord_bot.guild).members.has(userID);
};

helpers.setNickname = function (discordID, newNick){
  client.guilds.get(config.discord_bot.guild).members.get(discordID).setNickname(newNick);
};

helpers.getMemberObjectByID = function(userID, callback){
  try {
    callback(client.guilds.get(config.discord_bot.guild).members.get(userID));
  } catch (e) {
    callback(false);
  }
};

helpers.banMember = function(userID){
  if(ENVIRONMENT == 'testing') {
    emitter.emit('testing_discordhelpers_ban', userID);
    return;
  }
  client.guilds.get(config.discord_bot.guild).members.get(userID).ban();
};

//Init script, needs to be called from discord_bot.js, so we can use the client object here
helpers.init = function (origClient) {
  client = origClient;
};

//Export the container
module.exports = helpers;
