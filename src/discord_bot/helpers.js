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

helpers.sendNewApplicationMessage = function(application){
  helpers.sendMessage('New application from ' + application.getMcIgn() + '\nYou can find it here: https://paxterya.com/interface', config.discord_bot.channel.new_application_announcement, function (err) {
    if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', {err: err, application: application});
  });
};

helpers.sendAcceptedMemberWelcomeMessage = function (application) {
  let msg = '';
  if(application.getPublishAboutMe()) msg = `Welcome <@${application.getDiscordId()}> to Paxterya!\nHere is the about me text they sent us:\n${application.getAboutMe()}`;
  else msg = `Welcome <@${application.getDiscordId()}> to Paxterya!`;
  msg += '\n\nThis means you can now join the server! If you have any troubles please ping the admins!\n';
  msg += 'It is also a good time to give our rules a read: https://paxterya.com/rules\n';
  msg += 'Please also take a look at our FAQ: <#${user.guild.channels.find(channel => channel.name == "faq").id}>\n';
  msg += 'The IP of the survival server is paxterya.com and the IP for the creative Server is paxterya.com:25566\n\n';
  msg += 'If you encounter any issues or have any questions, feel free to contact our staff.'
  helpers.sendMessage(msg, config.discord_bot.channel.new_member_announcement, function (err) {
    if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the welcome message', {err: err, application: application});
  });
};

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
  if(ENVIRONMENT === "testing"){
    emitter.emit("testing_discordHelpers_sendMessage", message, channelID);
    callback(false);
    return;
  }

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
  if(ENVIRONMENT === "testing"){
    emitter.emit("testing_discordHelpers_addMemberToRole", discordID, roleID);
    callback(false);
    return;
  }
  client.guilds.get(config.discord_bot.guild).members.get(discordID).addRoles([roleID])
  .then(() => callback(false))
  .catch(e => callback(e));
};

helpers.removeMemberFromRole = function(discordID, roleID, callback){
  if(ENVIRONMENT === "testing") {
    emitter.emit("testing_discordHelpers_removeMemberFromRole", discordID, roleID);
    callback(false);
    return;
  }
  client.guilds.get(config.discord_bot.guild).members.get(discordID).removeRoles([roleID])
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
