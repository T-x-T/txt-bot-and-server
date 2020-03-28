/*
 *  MINECRAFT HELPERS
 *  Contains various helper functions for different Minecraft related operations
 */

//Dependencies
const config = require('../../config.js');
const https = require('https');
const user = require('../user');
const fs = require('fs');
const path = require('path');
const Rcon = require('rcon');
const { exec } = require('child_process');
const discord_helpers = require('../discord_bot/discord_helpers.js');

//REMOVE
const data = require('../user/main.js');

//Create the container
var mc = {};

//Create the global variable that holds the current player count
global.mcPlayerCount = 0;

/*
 *  Stuff about UUID -> IGN and IGN -> UUID conversion
 *
 */

//Updates all IGNs from all members based on their UUID
mc.updateAllIGNs = function(){
  //Get all members from db
  user.get({}, false, function(err, members){
    members.forEach((member) => {
      //Check if the user has a ign, if not, then we have nothing to do
      if(member.mcUUID != null){
        //Get the ign for the uuid
        mc.getIGN(member.mcUUID, function(ign){
          if(ign){
            //Save ign
            member.mcName = ign;
            user.edit(member, false, function(err, docs){});
          }else{
            global.log(2, 'mc_helpers.updateAllIGNs couldnt get a valid IGN for user', member);
          }
        });
      }
    });
  });
};

//Takes an IGN and returns the UUID
mc.getUUID = function(ign, callback){
  //Check if the ign is ok
  ign = typeof(ign) == 'string' && ign.length >= 3 && ign.length <= 16 ? ign : false;
  if(ign){
    //Make the web request
    https.get({
      host: 'api.mojang.com',
      port: 443,
      path: `/users/profiles/minecraft/${encodeURIComponent(ign)}?at=${Date.now()}`
    }, function(res){
      res.setEncoding('utf8');
      let data = '';
      res.on('data', function (chunk) {
          data += chunk;
      }).on('end', function () {
        //Do something with the data the webrequest returned
        //Try to parse the data
        try{
          data = JSON.parse(data);
        }catch(e){
          global.log(2, 'mc_helpers.getUUID couldnt pare the JSON returned from Mojangs API', {error: e, data: data,ign: ign});
        }

        //Check if the returned data makes sense
        if(data.hasOwnProperty('id')){
          if(data.id.length == 32){
            //Returned object is valid
            callback(data.id);
          }else{
            callback(false);
          }
        }else{
          //Data isnt valid
          callback(false);
        }
      });
    });
  }else{
    //The ign isnt ok
    callback(false);
  }
};

//Takes an UUID and returns the current IGN
mc.getIGN = function(uuid, callback){
  //Check if the uuid is ok
  uuid = typeof(uuid) == 'string' && uuid.length == 32 ? uuid : false;
  if(uuid){
    //Make the web request
    https.get({
      host: 'api.mojang.com',
      port: 443,
      path: `/user/profiles/${uuid}/names`
    }, function(res){
      res.setEncoding('utf8');
      let data = '';
      res.on('data', function (chunk) {
          data += chunk;
      }).on('end', function () {
        //Do something with the data the webrequest returned
        //Try to parse the data
        let dataOK;
        try{
          data = JSON.parse(data);
          dataOK = true;
        }catch(e){
          global.log(2, 'mc_helpers.getIGN couldnt pare the JSON returned from Mojangs API', {error: e, data: data, uuid: uuid});
          dataOK = false;
        }
        if(dataOK){
          //Only save the latest entry
          data = data[data.length - 1];
          //Check if the returned data makes sense
          if(data.hasOwnProperty('name')){
            //Returned object is valid
            callback(data.name);
          }else{
            //Data isnt valid
            callback(false);
          }
        }else{
          callback(false);
        }
      });
    });
  }else{
    //The ign isnt ok
    callback(false);
  }
};

mc.getRenderUrl = function(mcUUID){
  return `https://crafatar.com/renders/body/${mcUUID}?overlay=true`;
};

/*
 *  Stuff about stats
 *
 */

mc.updateStats = function(){
  //Get all files from the directory
  fs.readdir(path.join(__dirname, './../mc_stats/'), function(err, files){
    if(!err){
      //Lets read every file in
      files.forEach((file) => {
        //Check if we already logged this file by comparing write times
        fs.stat(path.join(__dirname, './../mc_stats/' + file), function(err, stats){
          if(!err){
            let fileWriteTime = stats.mtimeMs;
            //Get the uuid from the filename
            let uuid = file.replace('.json', '').replace('-','').replace('-','').replace('-','').replace('-','');
            data.getLastTimestampMcStats(uuid, function(dbWriteTime){
              //Compare both timestamps
              if (new Date(dbWriteTime).getTime() < fileWriteTime){
                //DB version is older
                //Read the stats file for the current member
                fs.readFile(path.join(__dirname, './../mc_stats/' + file), 'utf8', function(err, fileData){
                  if(!err && fileData.length > 0){
                    //Read in some file which seems valid, try to parse it to an object
                    let stats = false;
                    try{
                      stats = JSON.parse(fileData);
                    }catch(e){
                      global.log(2, 'mc_helpers.updateStats couldnt save the new data', {err: e, data: fileData});
                    }
                    if(stats){
                      data.addMcStats(uuid, stats, function(err){
                        if(err) global.log(2, 'mc_helpers.updateStats couldnt parse the data read from disk', {err: e, data: fileData});
                      });
                    }
                  }else{
                    global.log(2, 'mc_helpers.updateStats couldnt read the stats from disk', {err: err, file: file});
                  }
                });
              }
            });
          }else{
            global.log(2, 'mc_helpers.updateStats couldnt read the modified data of the file', {err: err, mcUUID: member.mcUUID});
          }
        });
      });
    }else{
      global.log(2, 'mc_helpers.updateStats couldnt read the files from the directory', {err: err});
    }
  });
};

//Downloads all stats from the server
mc.downloadStats = function(){
  void(exec(`rclone copy ${config['mc-stats-remote']}:/stats ./mc_stats`), (err, stdout, stderr) => {
    if (err) {
      global.log(2, 'Couldnt start the process to mount the sftp server', {error: err});
    }
  });
};

/*
 *  RCON
 *
 */

//Initializes the connection to the rcon server, sends a message and terminates the connection again
mc.rcon = function(cmd, callback){
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
      global.log(0, 'mc_helpers successfully authenticated to the rcon server', {cmd: cmd});
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

mc.getOnlinePlayers = function(callback){
  mc.rcon('list', function(str){
    callback(parseInt(str.replace('There are ', '')));
  });
};

mc.updateOnlinePlayers = function(){
  mc.getOnlinePlayers(function(count){
    global.mcPlayerCount = count;
  });
};

//Updates the role prefixes on the server
mc.updateRoles = function(){
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
            if(roles.indexOf('admin') > -1) prefix = '&4admin';

            if(prefix) {
              //There is a prefix, lets finish it up
              prefix = `[${prefix}&r]`;
            }else{
              //There is no prefix, send clear to clear it
              prefix = 'clear';
            }

            //Now add the command to the list of commands to send
            commands.push(`paxprefix ${member.mcName} ${prefix}`);
          }
          //Now check if this was the last execution of the loop
          j++;
          if(j == members.length - 1) mc.rcon(commands);
        });
      }); 
    }
  });
};

//Export the container
module.exports = mc;
