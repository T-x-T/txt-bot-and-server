/*
 *  MINECRAFT HELPERS
 *  Contains various helper functions for different Minecraft related operations
 */

//Dependencies
const https = require('https');
const user = require('../user');

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
        mc.getIGN(member.mcUUID, function(err, ign){
          if(ign){
            //Save ign
            member.mcName = ign;
            user.edit(member, false, function(err, docs){});
          }else{
            global.log(2, 'minecraft', 'mc_helpers.updateAllIGNs couldnt get a valid IGN for user', member);
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
          global.log(2, 'minecraft', 'mc_helpers.getUUID couldnt pare the JSON returned from Mojangs API', {error: e, data: data,ign: ign});
        }
        global.log(0, 'minecraft', 'getUUID received valid data', {ign: ign, data: data});
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
          global.log(2, 'minecraft', 'mc_helpers.getIGN couldnt pare the JSON returned from Mojangs API', {error: e, data: data, uuid: uuid});
          dataOK = false;
        }
        if(typeof data != 'object' || typeof data == 'undefined') dataOK = false;
        if(dataOK){
          global.log(0, 'minecraft', 'getIGN received valid data', {uuid: uuid, data: data});
          //Only save the latest entry
          data = data[data.length - 1];
          //Check if the returned data makes sense
          if(typeof data !== 'undefined'){
            if(data.hasOwnProperty('name')){
              //Returned object is valid
              callback(false, data.name);
            }else{
              //Data isnt valid
              callback('Data from API doesnt contain valid ign: ' + data, false);
            }
          }else{
            callback('Data from API doesnt is undefined and doesnt contain valid ign: ' + data, false);
          }
          
        }else{
          callback('data isnt valid: ' + data, false);
        }
      });
    });
  }else{
    //The ign isnt ok
    callback('The input isnt ok: ' + uuid, false);
  }
};

mc.returnRenderUrl = function(mcUUID){
  return `https://crafatar.com/renders/body/${mcUUID}?overlay=true`;
};

//Export the container
module.exports = mc;
