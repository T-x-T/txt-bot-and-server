/*
*  DISCORD HELPER FUNCTIONS
*  Some helper functions for discord stuff
*/

//Dependencies
const config = require('./../config.js');
const data = require('./../lib/data.js');
const log = require('./../lib/log.js');

//Global var
var client;

//Create the container
var helpers = {};

//Get the nickname of user by their id
helpers.getNicknameByID = function (userID, callback) {
  try {
    callback(client.users.get(userID).username);
  } catch (e) {
    callback(false);
  }
};

helpers.getMemberObjectByID = function(userID, callback){
  try {
    callback(client.guilds.get(config['guild']).members.get(userID));
  } catch (e) {
    callback(false);
  }
};

//Get the last message from a channel
helpers.getLastMessage = function (channelID, callback) {
  var lastMsg = '';
  var curChannel = client.guilds.get(config.guild).channels.get(channelID);

  curChannel.fetchMessages({ limit: 1 })
  .then(messages => {
    lastMsg = messages.first().content;
    callback(lastMsg);
  })
  .catch(e => {
    console.log(e);
    callback(false);
  });
};

//Sends a given message in a given channel
helpers.sendMessage = function (message, channelID, callback) {
  if (message.length > 0 && channelID.length > 0) {
    //Input seems fine
    var curChannel = client.guilds.get(config.guild).channels.get(channelID);
    curChannel.send(message)
    .then(message => {
      callback(false);
    })
    .catch(e => {
      callback(e);
    });
  } else {
    //Input isnt fine
    callback(true);
  }
};

//Returns all roles from the guild defined in config.js
//Returns only roles that members are allowed to join/leave themselves!
helpers.getRoles = function(){
  let roles = [];
  client.guilds.get(config.guild).roles.map(function(item){
    if(item.name.indexOf('#') > -1) roles.push({id: item.id, name: item.name});
  });
  return roles;
};

//Returns the role ID of a role by name
helpers.getRoleId = function(roleName){
  let id = -1;
  client.guilds.get(config.guild).roles.map(function(item){
    if(item.name == roleName) id = item.id;
  });
  return id;
};

//Add the ign to the users nick if necessary. the user variable requires a discord guildmember object
helpers.addIgnToNick = function(member){
  let nick = member.displayName;
  data.getUserData(member.id, function(err, document){
    if(!err){
      let ign = typeof document.mcName == 'string' ? document.mcName : '';
      try{
        //Now we have the discord nick and the mc ign, so lets compare them to find out if they are different
        if(!(nick.toLowerCase().indexOf(ign.toLowerCase()) > -1 || ign.toLowerCase().indexOf(nick.toLowerCase()) > -1)){
          //Now its time to change the users nick
          member.setNickname(`${nick} (${ign})`)
          .catch(console.log);
        }
      }catch(e){
        console.log(member.id);
      }
    }else{
      log.write(2, 'discord_helpers.addIgnToNick couldnt get the member document', {user: user.id, err: err});
    }
  });
};

//Init script, needs to be called from discord_bot.js, so we can use the client object here
helpers.init = function (origClient) {
  client = origClient;
};

//Export the container
module.exports = helpers;
