/*
 *  RCON INTERFACE
 *  This file handles all tasks related to rcon and sendming commands to the minecraft server
 */

//Dependencies
const Rcon = require('rcon');

//Create the container
var rcon = {};

//Initializes the connection to the rcon server, sends a message and terminates the connection again
rcon.send = function(cmd, callback){
  //Check if cmd is an array
  if(Array.isArray(cmd)){  
    global.log(0, 'minecraft', 'rcon.send received array', {cmd: cmd});
    cmd.forEach((_cmd) => {
      rcon.send(_cmd);
    });
  }else{
    //Setup of the connection
    let rconCon = new Rcon(config.minecraft.rcon_server, config.minecraft.rcon_port, config.minecraft.rcon_password);

    //Establish the connection
    rconCon.on('response', (str) => {
      global.log(0, 'minecraft', 'rcon.send received message from server that was a response', {message: str});
      if(typeof callback == 'function') callback(str);
    });
    rconCon.on('server', (str) => {
      global.log(0, 'minecraft', 'rcon.send received message from server that wasnt a response', {message: str});
    })
    rconCon.on('error', (err) => {
      global.log(0, 'minecraft', 'rcon.send received an error', {err: err});
    })
    rconCon.on('auth', () => {
      //Everything fine, send the command
      global.log(0, 'minecraft', 'rcon.send successfully authenticated to the rcon server', {cmd: cmd});
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
};

rcon.getOnlinePlayers = function(callback){
  rcon.send('list', function(str){
    callback(parseInt(str.replace('There are ', '')));
  });
};

rcon.updateOnlinePlayers = function(){
  rcon.getOnlinePlayers(function(count){
    global.mcPlayerCount = count;
  });
};

//Export the container
module.exports = rcon;