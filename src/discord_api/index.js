/*
 *  INDEX FILE FOR DISCORD_API COMPONENT
 *  This file contains all functions that are to be called from other components
 */

//Dependencies
const main = require('./main.js');

//Create the container
var index = {};

//Returns a userObject from discords api
//Input is an object with the type as a key
//Allowed types are: id, token
index.getUserObject = function(input, options, callback){
  global.log(0, 'discord_api', 'index.getUserObject got called', {input: input, options: options});
  if(input.hasOwnProperty('id')){
    main.getUserObjectById(input.id, options, callback);
  }else if (input.hasOwnProperty('token')){
    main.getUserObject(input.token, callback);
  }else{
    callback('No valid input received, input: ' + input, false);
  }
};

//Calls back the guildMember Object using the discord bot
index.getMemberObjectByID = function(discord_id, callback){
  main.getMemberObjectByID(discord_id, callback);
};

//Updates the userobject cache
index.updateCache = function(){
  global.log(0, 'discord_api', 'index.updateCache', {});
  main.updateUserIdCache();
};

//only works for guildMembers
index.getNicknameByID = function(userID, callback){
  global.log(0, 'discord_api', 'index.getNicknameByID', {userID: userID});
  main.getNicknameByID(userID, callback);
};

index.getAvatarUrl = function(discord_id, callback){
  main.getAvatarUrl(discord_id, callback);
};

//Export the container
module.exports = index;