/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

//Dependencies
var user;

//This is somehow neccessary, otherwise data will just be an empty object for whatever reason
setTimeout(function(){
  user = require('../user');
}, 0);

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
  .then(callback(false))
  .catch(callback(true));
};

//Returns true if the given discord id is member of the guild and false if not
helpers.isGuildMember = function(userID){
  return client.guilds.get(config.discord_bot.guild).members.has(userID);
};

//Set the nick of a user to their mc_ign
helpers.updateNick = function(discord_id) {
  if(discord_id == client.guilds.get(config.discord_bot.guild).ownerID) return; //Dont update the owner of the guild, this will fail
  user.get({discord: discord_id}, {privacy: true, onlyPaxterians: true, first: true}, function(err, doc) {
    if(doc) {
      let ign = typeof doc.mcName == 'string' ? doc.mcName : '';
      //Get the members object
      helpers.getMemberObjectByID(discord_id, function(member) {
        if(member) {
          //Now its time to change the users nick
          member.setNickname(ign)
            .catch((e) => {global.log(2, 'discord_bot', 'discord_helpers.updateNick failed to set the members nickname', {user: member.id, err: e});});
        } else {
          global.log(2, 'discord_bot', 'discord_helpers.updateNick couldnt get the member object', {user: discord_id, member: member});
        }
      });
    } else {
      global.log(2, 'discord_bot', 'discord_helpers.updateNick couldnt get the member document', {user: discord_id});
    }
  });
};

//Set the nick of all users to their mc_ign
helpers.updateAllNicks = function(){
  user.get({}, {onlyPaxterians: true, privacy: true}, function(err, docs){
    if(docs){
      docs.forEach((doc) => {
        helpers.updateNick(doc.discord)
      });
    }else{
      global.log(2, 'discord_bot', 'discord_helpers.updateAllNicks couldnt get the member database entries', {});
    }
  });
};

helpers.getMemberObjectByID = function(userID, callback){
  try {
    callback(client.guilds.get(config.discord_bot.guild).members.get(userID));
  } catch (e) {
    callback(false);
  }
};

//Init script, needs to be called from discord_bot.js, so we can use the client object here
helpers.init = function (origClient) {
  client = origClient;
};

//Export the container
module.exports = helpers;
