/*
 *  INDEX FILE FOR MINECRAFT COMPONENT
 *  The minecraft component handles all communication with the minecraft server and mojangs API
 */

//Dependencies
import main = require("./main.js");
import rcon = require("./rcon.js");

//Create the global variable that holds the current player count
global.g.mcPlayerCount = 0;

export = {
  //Gets uuid for a given ign
  getUUID(ign: string, callback: Function){
    main.getUUID(ign, callback);
  },

  //Gets ign for a given uuid
  getIGN(uuid: string, callback: Function){
    main.getIGN(uuid, callback);
  },

  //Returns the url for the render of an uuid
  returnRenderUrl(uuid: string){
    return main.returnRenderUrl(uuid);
  },

  //Updates the amount of players that are currently online; amount gets stored in global variable: global.g.mcPlayerCount
  updateOnlinePlayers(){
    rcon.updateOnlinePlayers();
  },

  //Always checks the survival server
  getServerVersion(callback: Function){
    rcon.getServerVersion((res: string) => callback(res));
  },

  //Sends a command directly to the minecraft server using rcon; Only use in edge cases! Rather use events
  sendCmd(cmd: string | string[], server?: string, callback?: Function){
    rcon.send(cmd, server, function(res: string){
      if(res && typeof callback == 'function') callback(res);
    });
  },

  whitelist(uuid: string){
    main.getIGN(uuid, function (err: string, ign: string) {
      if(!err && ign) {
        rcon.send(`whitelist add ${ign}`);
      } else {
        global.g.log(2, 'minecraft', 'index.whitelist couldnt get the ign', {err: err, ign: ign, mcUuid: uuid});
      }
    });
  }
};