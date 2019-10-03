/*
 *  MINECRAFT HELPERS
 *  Contains various helper functions for different Minecraft related operations
 */

//Dependencies
const config = require('./../config.js');
const https = require('https');
const data = require('./data.js');
const log = require('./log.js');

//Create the container
const mc = {};

//Updates all UUIDs from all members, if forceUpdate is true all UUIDs get overwritten, otherwise only check for users without an UUID
mc.updateAllUUIDs = function(forceUpdate){
  //Get all members from the db
  data.listAllMembers(function(members){
    members.forEach((member) => {
      //Check if we need to update this members UUID
      if(forceUpdate || member.mcName != null && member.mcUUID == null){
        //Get the UUID for the current member
        mc.getUUID(member.mcName, function(uuid){
          if(uuid){
            //Save UUID
            member.mcUUID = uuid;
            data.updateUserData(member.discord, member, function(err){});
          }else{
            //Something bad happened, log it
            log.write(2, 'mc_helpers.updateAllUUIDs couldnt get valid UUID for user', member, function(err){});
          }
        });
      }else{
        //We dont need to do anything
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
      path: `/users/profiles/minecraft/${ign}?at=${Date.now()}`
    }, function(res){
      res.setEncoding('utf8');
      let data = '';
      res.on('data', function (chunk) {
          data += chunk;
      }).on('end', function () {
        //Do something with the data the webrequest returned
        //Parse the data
        data = JSON.parse(data);
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
        //Parse the data
        data = JSON.parse(data);
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
      });
    });
  }else{
    //The ign isnt ok
    callback(false);
  }
};

//Export the container
module.exports = mc;
