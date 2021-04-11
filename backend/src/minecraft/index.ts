/*
 *  INDEX FILE FOR MINECRAFT COMPONENT
 *  The minecraft component handles all communication with the minecraft server and mojangs API
 */

//Dependencies
const main = require("./main.js");
const rcon = require("./rcon.js");

//Create the global variable that holds the current player count
global.g.mcPlayerCount = 0;

module.exports = {
  //Gets uuid for a given ign
  getUUID(ign, callback){
    main.getUUID(ign, callback);
  },

  //Gets ign for a given uuid
  getIGN(uuid, callback){
    main.getIGN(uuid, callback);
  },

  //Returns the url for the render of an uuid
  returnRenderUrl(uuid){
    return main.returnRenderUrl(uuid);
  },

  //Updates the amount of players that are currently online; amount gets stored in global variable: global.g.mcPlayerCount
  updateOnlinePlayers(){
    rcon.updateOnlinePlayers();
  },

  //Always checks the survival server
  getServerVersion(callback){
    rcon.getServerVersion(res => callback(res));
  },

  //Sends a command directly to the minecraft server using rcon; Only use in edge cases! Rather use events
  sendCmd(cmd, server, callback?){
    rcon.send(cmd, server, function(res){
      if(res && typeof callback == 'function') callback(res);
    });
  },

  whitelist(mcUuid){
    main.getIGN(mcUuid, function (err, ign) {
      if(!err && ign) {
        rcon.send(`whitelist add ${ign}`, false, function (res) {});
      } else {
        global.g.log(2, 'minecraft', 'index.whitelist couldnt get the ign', {err: err, ign: ign, mcUuid: mcUuid});
      }
    });
  }
};

export default {}