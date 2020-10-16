/*
 *  INDEX FILE FOR MINECRAFT COMPONENT
 *  The minecraft component handles all communication with the minecraft server and mojangs API
 */

//Dependencies
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

//Always checks the survival server
index.getServerVersion = function(callback){
  rcon.getServerVersion(res => callback(res));
};

//Sends a command directly to the minecraft server using rcon; Only use in edge cases! Rather use events
index.sendCmd = function(cmd, server, callback){
  rcon.send(cmd, server, function(res){
    if(res && typeof callback == 'function') callback(res);
  });
};

index.whitelist = function(mcUuid){
  main.getIGN(mcUuid, function (err, ign) {
    if(!err && ign) {
      rcon.send(`whitelist add ${ign}`, false, function (res) {});
    } else {
      global.log(2, 'minecraft', 'emitter.on application_accepted_joined couldnt get the ign', {err: err, ign: ign, mcUuid: mcUuid});
    }
  });
}

//Export the container
module.exports = index;