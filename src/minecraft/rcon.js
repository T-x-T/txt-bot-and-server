/*
 *  RCON INTERFACE
 *  This file handles all tasks related to rcon and sendming commands to the minecraft server
 */

//Dependencies
const Rcon = require('rcon');

//Create the container
var rcon = {};

//Initializes the connection to the rcon server, sends a message and terminates the connection again
rcon.send = function(cmd, server, callback){
  //Abort if we are in testing mode
  if(ENVIRONMENT == 'testing') {
    emitter.emit('testing_minecraft_rcon_send', cmd, server);
    return;
  }

  if(!global.config.minecraft.rcon_enabled){
    global.log(0, 'minecraft', 'rcon.send received command to send, although its disabled', {});
    return;
  }
  
  //Check if cmd is an array
  if(Array.isArray(cmd)){  
    global.log(0, 'minecraft', 'rcon.send received array', {cmd: cmd});
    cmd.forEach((_cmd) => {
      rcon.send(_cmd, server);
    });
  } else {
    //Do all the sending for every configured server
    let servers = {};
    if(!server) servers = global.config.minecraft.rcon_servers
      else if(global.config.minecraft.rcon_servers[server]){
        servers[server] = global.config.minecraft.rcon_servers[server];
      }else{
        servers = false;
      }

    if(!servers){
      global.log(0, 'minecraft', 'rcon.send received non-existent server', {cmd: cmd, server: server});
      if (typeof callback == 'function') callback('invalid server');
      return;
    }

    for (let _server in servers) {
      _server = servers[_server];
      //Setup of the connection
      let rconCon = new Rcon(_server.rcon_server, _server.rcon_port, _server.rcon_password);

      //Establish the connection
      rconCon.on('response', (str) => {
        global.log(0, 'minecraft', 'rcon.send received message from server that was a response', {server: _server.rcon_server, message: str });
        if (typeof callback == 'function') callback(str);
      });
      rconCon.on('server', (str) => {
        global.log(0, 'minecraft', 'rcon.send received message from server that wasnt a response', {server: _server.rcon_server,  message: str });
      });
      rconCon.on('error', (err) => {
        global.log(0, 'minecraft', 'rcon.send received an error', { err: err });
      });
      rconCon.on('auth', () => {
        //Everything fine, send the command
        global.log(0, 'minecraft', 'rcon.send successfully authenticated to the rcon server', {server: _server.rcon_server,  cmd: cmd });
        rconCon.send(cmd);
        //We can disconnect again
        rconCon.disconnect();
      });

      //Connect
      try {
        rconCon.connect();
      } catch (e) {
        //Dont do anything
      }
    }
  }
};

rcon.getOnlinePlayers = function(callback){
  rcon.send('list', global.config.minecraft.rcon_main_server, function(str){
    callback(parseInt(str.replace('There are ', '')));
  });
};

rcon.updateOnlinePlayers = function(){
  rcon.getOnlinePlayers(function(count){
    global.mcPlayerCount = count;
  });
};

rcon.getServerVersion = function(callback){
  rcon.send("version", global.config.minecraft.rcon_main_server, res => {
    let version = "";
    let inVersion = false;
    res.split("\n")[0].split("").forEach(char => {
      if(char === "(") inVersion = true;
      if(inVersion && (char === "." || Number.isInteger(Number.parseInt(char)))) version += char;
    });
    version = version.substring(0, 6);
    callback(version);
  });
};

//Export the container
module.exports = rcon;