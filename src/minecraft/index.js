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

//Sends a command directly to the minecraft server using rcon; Only use in edge cases! Rather use events
index.sendCmd = function(cmd, server, callback){
  rcon.send(cmd, server, function(res){
    if(res && typeof callback == 'function') callback(res);
  });
};


//Even listeners
emitter.on('user_left', (member, user) => {
  global.log(0, 'minecraft', 'event user_left received', {member: member});
  rcon.send(`whitelist remove ${user.mcName}`, false, function(res){});
});

emitter.on('user_banned', (member, user) => {
  global.log(0, 'minecraft', 'event user_banned received', {member: member});
  rcon.send(`whitelist remove ${user.mcName}`, false, function(res){});
  rcon.send(`ban ${user.mcName}`, false, function(res){});
});

emitter.on('application_accepted_joined', (app) => {
  global.log(0, 'minecraft', 'event application_accepted_joined received', {app: app});
  main.getIGN(app.mc_uuid, function(err, ign){
    if(!err && ign){
      rcon.send(`whitelist add ${ign}`, false, function(res){});
    }else{
      global.log(2, 'minecraft', 'emitter.on application_accepted_joined couldnt get the ign', {err: err, ign: ign, application: app});
    }
  });
});



//Export the container
module.exports = index;