/*
 *  RCON INTERFACE
 *  This file handles all tasks related to rcon and sendming commands to the minecraft server
 */

//Dependencies
const Rcon = require('rcon');
const user = require('../user');
const discord_helpers = require('../discord_bot');

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

//Updates the role prefixes on the server
rcon.updateRoles = function(){
  global.log(0, 'minecraft', 'rcon.updateRoles got triggered', false);
  //Get all members
  user.get({}, {privacy: true, onlyPaxterians: true}, function(err, members){
    global.log(0, 'minecraft', 'rcon.updateRoles got users from db', {members: members});
    if(!err && members){
      //Container for all commands to send once where done preparing
      let commands = [];
      //Build and Add prefix for each member to commands
      members.forEach((member) => {
        global.log(0, 'minecraft', 'rcon.updateRoles start processing user', {members: members, member: member});
        discord_helpers.getMemberObjectByID(member.discord, function(memberObj) {
          if(memberObj) {
            global.log(0, 'minecraft', 'rcon.updateRoles got discord object from user', {memberObj: memberObj});
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
            commands.push(`this_isnt_a_command`);
            global.log(0, 'minecraft', 'rcon.updateRoles couldnt get memberData from discord', {member: member});
          }
          //Now check if this was the last execution of the loop
          if(commands.length == members.length) {
            global.log(0, 'minecraft', 'rcon.updateRoles sent commands to rcon.send', {commands: commands});
            rcon.send(commands);
          }
        });
      }); 
    }
  });
};

//Export the container
module.exports = rcon;