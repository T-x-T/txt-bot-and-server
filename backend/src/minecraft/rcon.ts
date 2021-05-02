/*
 *  RCON INTERFACE
 *  This file handles all tasks related to rcon and sending commands to the minecraft server
 */

//Dependencies
import Rcon = require("./node-rcon.js");
import log = require("../log/index.js");

interface IRconServer {
  rcon_server: string,
  rcon_port: number,
  rcon_password: string
}

let serverVersion = {
  version: "",
  lastUpdate: Date.now()
}

const rcon = {
  //Initializes the connection to the rcon server, sends a message and terminates the connection again
  send(cmd: string | string[], server?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      //Abort if we are in testing mode
      if(global.g.ENVIRONMENT == "testing") {
        global.g.emitter.emit("testing_minecraft_rcon_send", cmd, server);
        resolve(null);
      }

      if(!global.g.config.minecraft.rcon_enabled) {
        log.write(0, "minecraft", "rcon.send received command to send, although its disabled", {});
        resolve(null);
      }

      if(Array.isArray(cmd)) {
        log.write(0, "minecraft", "rcon.send received array", {cmd: cmd});
        cmd.forEach((_cmd) => {
          rcon.send(_cmd, server);
        });
        resolve(null);
      }

      let servers: IRconServer[] = [];
      if(!server) {
        Object.values(global.g.config.minecraft.rcon_servers).forEach((server: IRconServer) => servers.push(server));
      } else {
        servers.push(global.g.config.minecraft.rcon_servers[server]);
      }

      if(!servers) {
        log.write(0, "minecraft", "rcon.send received non-existent server", {cmd: cmd, server: server});
        reject(new Error("Invalid server: " + server));
      }

      servers.forEach(server => {
        const con = new Rcon(server.rcon_server, server.rcon_port, server.rcon_password);

        con.on("response", (str: string) => {
          log.write(0, "minecraft", "rcon.send received message from server that was a response", {server: server.rcon_server, message: str});
          resolve(str);
        });
        con.on("server", (str: string) => {
          log.write(0, "minecraft", "rcon.send received message from server that wasnt a response", {server: server.rcon_server, message: str});
        });
        con.on("error", (err: Error) => {
          log.write(0, "minecraft", "rcon.send received an error", {err: err});
          reject(err);
        });
        con.on("auth", () => {
          //Everything fine, send the command
          log.write(0, "minecraft", "rcon.send successfully authenticated to the rcon server", {server: server.rcon_server, cmd: cmd});
          con.send(cmd);
          //We can disconnect again
          con.disconnect();
        });

        //Connec
        con.connect();
      });
    });
  },

  async getOnlinePlayers() {
    return await rcon.send("list", global.g.config.minecraft.rcon_main_server);
  },

  async updateOnlinePlayers() {
    global.g.mcPlayerCount = await rcon.getOnlinePlayers();
  },

  async getServerVersion() {
    if(serverVersion.lastUpdate > Date.now() + 1000 * 60 * 60 && serverVersion.version.length > 0) return serverVersion.version;

    const res = await rcon.send("version", global.g.config.minecraft.rcon_main_server);
    let version = "";
    let inVersion = false;
    res.split("\n")[0].split("").forEach((char: string) => {
      if(char === "(") inVersion = true;
      if(inVersion && (char === "." || Number.isInteger(Number.parseInt(char)))) version += char;
    });
    version = version.substring(0, 6);

    serverVersion.version = version;
    serverVersion.lastUpdate = Date.now();
    return version;
  }
};

export = rcon;