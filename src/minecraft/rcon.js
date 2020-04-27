/*
 *  RCON INTERFACE
 *  This file handles all tasks related to rcon and sendming commands to the minecraft server
 */

//Dependencies
const config = require('../../config.js');
const Rcon = require('rcon');
const user = require('../user');

//Create the container
var rcon = {};

//Initializes the connection to the rcon server, sends a message and terminates the connection again
rcon.send = function(cmd, callback){
  //Check if cmd is an array
  if(Array.isArray(cmd)){
    cmd.forEach((_cmd) => {
      mc.rcon(_cmd);
    });
  }else{
    //Setup of the connection
    let rconCon = new Rcon(config['rcon-server'], config['rcon-port'], config['rcon-password']);

    //Establish the connection
    rconCon.on('response', function(str) {
      if(typeof callback == 'function') callback(str);
    });
    rconCon.on('auth', function() {
      //Everything fine, send the command
      global.log(0, 'minecraft', 'mc_helpers successfully authenticated to the rcon server', {cmd: cmd});
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

//Updates the role prefixes on the server
rcon.updateRoles = function(){
  //Dont run this when we are testing
  if(!config['use-external-certs']) return;

  //Get all members
  user.get({}, {privacy: true, onlyPaxterians: true}, function(members){
    if(members){
      //Container for all commands to send once where done preparing
      let commands = [];
      //Build and Add prefix for each member to commands
      let j = 0;
      members.forEach((member) => {
        discord_helpers.getMemberObjectByID(member.discord, function(memberObj) {
          if(memberObj) {
            //Check roles
            let roles = memberObj.roles.array();
            for(let i = 0;i < roles.length;i++) roles[i] = roles[i].name;
            
            //Set up the prefix
            let prefix = "";
            if(roles.indexOf('veteran') > -1) prefix = '&5og';
            if(roles.indexOf('cool kid squad') > -1) prefix = '&bcool';
            if(roles.indexOf('utp') > -1) prefix = '&6utp';
            if(roles.indexOf('developer') > -1) prefix = '&3dev';
            if(roles.indexOf('moderator') > -1) prefix = '&9mod';
            if(roles.indexOf('admin') > -1) prefix = '&4admin';

            if(prefix) {
              //There is a prefix, lets finish it up
              prefix = `[${prefix}&r]`;
            }else{
              //There is no prefix, send clear to clear it
              prefix = 'clear';
            }
            global.log(0, 'minecraft', 'rcon.updateRoles determined prefix for user', {memberObj: memberObj, prefix: prefix});
            //Now add the command to the list of commands to send
            commands.push(`paxprefix ${member.mcName} ${prefix}`);
          }else{
            global.log(0, 'minecraft', 'rcon.updateRoles couldnt get the member object', {member: member});
          }
          //Now check if this was the last execution of the loop
          j++;
          if(j == members.length - 1) {
            global.log(0, 'minecraft', 'rcon.updateRoles sent commands to rcon.send', {commands: commands});
            mc.rcon(commands);
          }
        });
      }); 
    }
  });
};

//Export the container
module.exports = rcon;