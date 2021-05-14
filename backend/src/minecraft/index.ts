/*
 *  INDEX FILE FOR MINECRAFT COMPONENT
 *  The minecraft component handles all communication with the minecraft server and mojangs API
 */

//Dependencies
import main = require("./main.js");
import rcon = require("./rcon.js");

export = {
  init(config: IConfigMinecraft, environment: EEnvironment) {
    rcon.init(config, environment);
  },

  getUUID: main.getUUID,
  getIGN: main.getIGN,
  getRenderUrl: main.getRenderUrl,
  sendCmd: rcon.send,
  getOnlinePlayers: rcon.getOnlinePlayers,
  getAfkPlayers: rcon.getAfkPlayers,
  getServerVersion: rcon.getServerVersion,

  async whitelist(uuid: string){
    rcon.send(`whitelist add ${await main.getIGN(uuid)}`);
  }
};