/*
 *  INDEX FILE FOR MINECRAFT COMPONENT
 *  The minecraft component handles all communication with the minecraft server and mojangs API
 */

//Dependencies
const config = require('../../config.js');
const main = require('./main.js');
const rcon = require('./rcon.js');

//Create the global variable that holds the current player count
global.mcPlayerCount = 0;

//Create the container
var index = {};

//All functions

index.updateAllIGNs = main.updateAllIGNs;

//Gets uuid for a given ign
index.getUUID = function(ign, callback){
  main.getUUID(ign, callback);
};

//Gets ign for a given uuid
index.getIGN = function(uuid, callback){
  main.getIGN(uuid, callback);
};

//Returns the url for the render of an uuid
index.returnRenderUrl = function(uuid){
  return main.returnRenderUrl(uuid);
};

//Updates the amount of players that are currently online; amount gets stored in global variable: global.mcPlayerCount
index.updateOnlinePlayers = function(){
  rcon.updateOnlinePlayers();
};




//Even listeners
emitter.on('user_left', (user) => {
  
});

emitter.on('user_banned', (user) => {
  
});

emitter.on('application_accepted_joined', (app) => {

});



//Export the container
module.exports = index;