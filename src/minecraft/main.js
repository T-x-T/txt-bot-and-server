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
const { exec } = require('child_process');

//REMOVE
const data = require('../user/main.js');

//Create the container
var mc = {};

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
            callback(false, data.id);
          }else{
            callback('Data from API doesnt contain valid id. ' + data, false);
          }
        }else{
          //Data isnt valid
          callback('Data from API doesnt contain id. ' + data, false);
        }
      });
    });
  }else{
    //The ign isnt ok
    callback('The input isnt ok: ' + ign, false);
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
            callback(false, data.name);
          }else{
            //Data isnt valid
            callback('Data from API doesnt contain valid ign: ' + data, false);
          }
        }else{
          callback('data isnt valid: ' + data, false);
        }
      });
    });
  }else{
    //The ign isnt ok
    callback('The input isnt ok: ' + ign, false);
  }
};

mc.returnRenderUrl = function(mcUUID){
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

//Export the container
module.exports = mc;
