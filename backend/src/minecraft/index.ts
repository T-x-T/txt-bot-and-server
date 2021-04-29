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
  getUUID: main.getUUID,
  getIGN: main.getIGN,
  getRenderUrl: main.getRenderUrl,
  sendCmd: rcon.send,
  updateOnlinePlayers: rcon.updateOnlinePlayers,
  getServerVersion: rcon.getServerVersion,

  async whitelist(uuid: string){
    rcon.send(`whitelist add ${await main.getIGN(uuid)}`);
  }
};