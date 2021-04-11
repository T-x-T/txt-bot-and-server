/*
 *  RCON INTERFACE
 *  This file handles all tasks related to rcon and sendming commands to the minecraft server
 */

//Dependencies
const Rcon = require('./node-rcon.js');

const rcon = {
  //Initializes the connection to the rcon server, sends a message and terminates the connection again
  send(cmd, server, callback?) {
    //Abort if we are in testing mode
    if(global.g.ENVIRONMENT == 'testing') {
      global.g.emitter.emit('testing_minecraft_rcon_send', cmd, server);
      return;
    }

    if(!global.g.config.minecraft.rcon_enabled) {
      global.g.log(0, 'minecraft', 'rcon.send received command to send, although its disabled', {});
      return;
    }

    //Check if cmd is an array
    if(Array.isArray(cmd)) {
      global.g.log(0, 'minecraft', 'rcon.send received array', {cmd: cmd});
      cmd.forEach((_cmd) => {
        rcon.send(_cmd, server);
      });
    } else {
      //Do all the sending for every configured server
      let servers: any = {};
      if(!server) servers = global.g.config.minecraft.rcon_servers
      else if(global.g.config.minecraft.rcon_servers[server]) {
        servers[server] = global.g.config.minecraft.rcon_servers[server];
      } else {
        servers = false;
      }

      if(!servers) {
        global.g.log(0, 'minecraft', 'rcon.send received non-existent server', {cmd: cmd, server: server});
        if(typeof callback == 'function') callback('invalid server');
        return;
      }

      for(let _server in servers) {
        let server = servers[_server];
        //Setup of the connection
        let rconCon = new Rcon(server.rcon_server, server.rcon_port, server.rcon_password);

        //Establish the connection
        rconCon.on('response', (str) => {
          global.g.log(0, 'minecraft', 'rcon.send received message from server that was a response', {server: server.rcon_server, message: str});
          if(typeof callback == 'function') callback(str);
        });
        rconCon.on('server', (str) => {
          global.g.log(0, 'minecraft', 'rcon.send received message from server that wasnt a response', {server: server.rcon_server, message: str});
        });
        rconCon.on('error', (err) => {
          global.g.log(0, 'minecraft', 'rcon.send received an error', {err: err});
        });
        rconCon.on('auth', () => {
          //Everything fine, send the command
          global.g.log(0, 'minecraft', 'rcon.send successfully authenticated to the rcon server', {server: server.rcon_server, cmd: cmd});
          rconCon.send(cmd);
          //We can disconnect again
          rconCon.disconnect();
        });

        //Connect
        try {
          rconCon.connect();
        } catch(e) {
          //Dont do anything
        }
      }
    }
  },

  getOnlinePlayers(callback) {
    rcon.send('list', global.g.config.minecraft.rcon_main_server, function (str) {
      callback(parseInt(str.replace('There are ', '')));
    });
  },

  updateOnlinePlayers() {
    rcon.getOnlinePlayers(function (count) {
      global.g.mcPlayerCount = count;
    });
  },

  getServerVersion(callback) {
    rcon.send("version", global.g.config.minecraft.rcon_main_server, res => {
      let version = "";
      let inVersion = false;
      res.split("\n")[0].split("").forEach(char => {
        if(char === "(") inVersion = true;
        if(inVersion && (char === "." || Number.isInteger(Number.parseInt(char)))) version += char;
      });
      version = version.substring(0, 6);
      callback(version);
    });
  }
};

module.exports = rcon;

export default {}