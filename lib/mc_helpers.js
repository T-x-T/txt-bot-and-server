/*
 *  MINECRAFT HELPERS
 *  Contains various helper functions for different Minecraft related operations
 */

//Dependencies
const config = require('./../config.js');
const https = require('https');
const data = require('./data.js');
const log = require('./log.js');
const fs = require('fs');
const path = require('path');
const Rcon = require('rcon');

//Create the container
const mc = {};

/*
 *  Stuff about UUID -> IGN and IGN -> UUID conversion
 *
 */

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

//Updates all IGNs from all members based on their UUID
mc.updateAllIGNs = function(){
  //Get all members from db
  data.listAllMembers(function(members){
    members.forEach((member) => {
      //Check if the user has a ign, if not, then we have nothing to do
      if(member.mcUUID != null){
        //Get the ign for the uuid
        mc.getIGN(member.mcUUID, function(ign){
          if(ign){
            //Save ign
            member.mcName = ign;
            data.updateUserData(member.discord, member, function(err){});
          }else{
            log.write(2, 'mc_helpers.updateAllIGNs couldnt get a valid IGN for user', member, function(err){});
          }
        })
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
        //Try to parse the data
        try{
          data = JSON.parse(data);
        }catch(e){
          log.write(2, 'mc_helpers.getUUID couldnt pare the JSON returned from Mojangs API', {error: e, data: data,ign: ign}, function(err){});
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
          log.write(2, 'mc_helpers.getIGN couldnt pare the JSON returned from Mojangs API', {error: e, data: data, uuid: uuid}, function(err){});
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

/*
 *  Stuff about stats
 *
 */


mc.updateStats = function(){
  //Get all members from the db
  data.listAllMembers(function(members){
    members.forEach((member) => {
      //Check if the member has a UUID, if not do absolutely Nothing
      if(!(member.mcUUID === null || member.mcUUID === '0')){
        //Check if we already logged this file by comparing write times
        fs.stat(path.join(__dirname, './../mc_stats/' + mc.convertUUIDtoWeirdFormat(member.mcUUID) + '.json'), function(err, stats){
          if(!err){
            let fileWriteTime = stats.mtimeMs;
            data.getLastTimestampMcStats(member.discord, function(dbWriteTime){
              //Compare both timestamps
              if(dbWriteTime < fileWriteTime){
                //DB version is older
                //Read the stats file for the current member
                fs.readFile(path.join(__dirname, './../mc_stats/' + mc.convertUUIDtoWeirdFormat(member.mcUUID) + '.json'), 'utf8', function(err, fileData){
                  if(!err && fileData.length > 0){
                    //Read in some file which seems valid, try to parse it to an object
                    let stats = false;
                    try{
                      stats = JSON.parse(fileData);
                    }catch(e){
                      log.write(2, 'mc_helpers.updateStats couldnt parse the data read from disk', {err: e, data: fileData}, function(e){});
                    }
                    if(stats){
                      //The stats are parsed correctly, lets write them to the db
                      data.addMcStats(member.discord, stats, function(err){});
                    }
                  }else{
                    log.write(2, 'mc_helpers.updateStats couldnt read the stats from disk', {err: err}, function(e){});
                  }
                });
              }
            });
          }else{
            log.write(2, 'mc_helpers.updateStats couldnt read the modified data of the file', {err: err, mcUUID: member.mcUUID}, function(e){});
          }
        });
      }
    });
  });
};

/*
 *  statistics templates
 *
 */

//Holder for all get stats templates functions
mc.getStatTemplate = function(discord, collection, callback){
  //If discord == false, get stats for all players combined, else get the stats for the given user
  if(discord){
    data.getNewestMcStats(discord, function(stats){
      if(stats){
        //Pass the stats to the template and callback the result
        callback(false, _statsTemplates[collection](stats));
      }else{
        log.write(0, 'mc_helpers.getStatTemplate.general couldnt find the specified user', {user: discord}, function(e){});
        callback('I couldnt find any stats for the specified player', false);
      }
    });
  }else{
    data.getNewestMcStats(false, function(stats){
      if(stats){
        //Pass the stats to the function which sums it all together and give its output to the template and callback the result
        callback(false, _statsTemplates[collection](mc.sumStats(stats)));
      }else{
        log.write(0, 'mc_helpers.getStatTemplate.general couldnt find the specified user', {user: discord}, function(e){});
        callback('I couldnt find any stats for the specified player', false);
      }
    });
  }
};

/*
 *  the actual statistics templates
 *
 */

//Holder for all stats templates (collections)
var _statsTemplates = {};

//Contains number of deaths, player kills, mob kills, playtime, Total distance by foot (walking + sprinting + crouching)
_statsTemplates.general = function(stats){
  let output = {};

  output.deaths = stats['minecraft:custom']['minecraft:deaths'];
  output.playerKills = stats['minecraft:custom']['minecraft:player_kills'];
  output.mobKills = stats['minecraft:custom']['minecraft:mob_kills'];
  output.damageDealt = stats['minecraft:custom']['minecraft:damage_dealt'];
  output.damageTaken = stats['minecraft:custom']['minecraft:damage_taken'];
  output.playtime = mc.prettifyDuration(stats['minecraft:custom']['minecraft:play_one_minute']);
  output.distanceByFoot = mc.prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:sprint_one_cm']);

  return output;
};

//Contains all different distances (walking, sprinting, boat, pig, climb, fall, elytra, ...)
_statsTemplates.distances = function(stats){
  let output = {};

  output.sprint = mc.prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm']);
  output.walkOnWater = mc.prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm']);
  output.crouch = mc.prettiyDistance(stats['minecraft:custom']['minecraft:crouch_one_cm']);
  output.climb = mc.prettiyDistance(stats['minecraft:custom']['minecraft:climb_one_cm']);
  output.walk = mc.prettiyDistance(stats['minecraft:custom']['minecraft:walk_one_cm']);
  output.walkUnderWater = mc.prettiyDistance(stats['minecraft:custom']['minecraft:walk_under_water_one_cm']);
  output.boat = mc.prettiyDistance(stats['minecraft:custom']['minecraft:boat_one_cm']);
  output.swim = mc.prettiyDistance(stats['minecraft:custom']['minecraft:swim_one_cm']);
  output.fly = mc.prettiyDistance(stats['minecraft:custom']['minecraft:fly_one_cm']);
  output.aviate = mc.prettiyDistance(stats['minecraft:custom']['minecraft:aviate_one_cm']);
  output.fall = mc.prettiyDistance(stats['minecraft:custom']['minecraft:fall_one_cm']);

  return output;
}

//Contains mined ores (Diamond, Iron, Gold, Emerald, Coal, Lapis Lazuli, Redstone)
_statsTemplates.minedOres = function(stats){
  let output = {};

  output.diamond = stats['minecraft:mined']['minecraft:diamond_ore'];
  output.iron = stats['minecraft:mined']['minecraft:iron_ore'];
  output.gold = stats['minecraft:mined']['minecraft:gold_ore'];
  output.emerald = stats['minecraft:mined']['minecraft:emerald_ore'];
  output.coal = stats['minecraft:mined']['minecraft:coal_ore'];
  output.lapis = stats['minecraft:mined']['minecraft:lapis_ore'];
  output.redstone = stats['minecraft:mined']['minecraft:redstone_ore'];

  return output;
};

//Contains totals for blocks mined, items used, items crafted, items broken, items dropped, distance traveled
_statsTemplates.totals = function(stats){
  let output = {};

  output.mined = mc.sumOfObject(stats['minecraft:mined']);
  output.used = mc.sumOfObject(stats['minecraft:used']);
  output.crafted = mc.sumOfObject(stats['minecraft:crafted']);
  output.broken = mc.sumOfObject(stats['minecraft:broken']);
  output.dropped = mc.sumOfObject(stats['minecraft:dropped']);
  output.traveled = mc.prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'] + stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:climb_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:boat_one_cm'] + stats['minecraft:custom']['minecraft:swim_one_cm'] + stats['minecraft:custom']['minecraft:fly_one_cm'] + stats['minecraft:custom']['minecraft:aviate_one_cm'] + stats['minecraft:custom']['minecraft:fall_one_cm']);


  return output;
};

//Contains top 10 used items with number of times used
_statsTemplates.topUsageItems = function(stats){
  let output = {};

  output = mc.top10(stats['minecraft:used']);

  return output;
};

//Contains top 10 picked up items
_statsTemplates.topPickedUpItems = function(stats){
  let output = {};

  output = mc.top10(stats['minecraft:picked_up']);

  return output;
};

//Contains top 10 mined blocks with number of times mined
_statsTemplates.topMinedBlocks = function(stats){
  let output = {};

  output = mc.top10(stats['minecraft:mined']);

  return output;
};

//Contains top 10 killed mobs with number of times killed
_statsTemplates.topKilledMobs = function(stats){
  let output = {};

  output = mc.top10(stats['minecraft:killed']);

  return output;
};

//Contains top 10 caused of death with number of times died
_statsTemplates.topKilledByMobs = function(stats){
  let output = {};

  output = mc.top10(stats['minecraft:killed_by']);

  return output;
};

//Contains some stats per death stats like k/d blocks mined per death, etc
_statsTemplates.totalPerDeath = function(stats){
  let output = {};

  output.mined = Math.round(mc.sumOfObject(stats['minecraft:mined']) / stats['minecraft:custom']['minecraft:deaths']);
  output.used = Math.round(mc.sumOfObject(stats['minecraft:used']) / stats['minecraft:custom']['minecraft:deaths']);
  output.crafted = Math.round(mc.sumOfObject(stats['minecraft:crafted']) / stats['minecraft:custom']['minecraft:deaths']);
  output.broken = Math.round(mc.sumOfObject(stats['minecraft:broken']) / stats['minecraft:custom']['minecraft:deaths']);
  output.dropped = Math.round(mc.sumOfObject(stats['minecraft:dropped']) / stats['minecraft:custom']['minecraft:deaths']);
  output.traveled = mc.prettiyDistance(Math.round((stats['minecraft:custom']['minecraft:sprint_one_cm'] + stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:climb_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:boat_one_cm'] + stats['minecraft:custom']['minecraft:swim_one_cm'] + stats['minecraft:custom']['minecraft:fly_one_cm'] + stats['minecraft:custom']['minecraft:aviate_one_cm'] + stats['minecraft:custom']['minecraft:fall_one_cm'])  / stats['minecraft:custom']['minecraft:deaths']));

  return output;
};

/*
 *  RCON
 *
 */

//Initializes the connection to the rcon server, sends a message and terminates the connection again
mc.rcon = function(cmd){
  //Establish the connection
  let rconCon = new Rcon(config['rcon-server'], config['rcon-port'], config['rcon-password']);
  rconCon.on('auth', function(){
    //Everything fine, send the command
    log.write(1, 'mc_helpers successfully authenticated to the rcon server', null, function(e){});
    rconCon.send(cmd);

    //We can disconnect again
    rconCon.disconnect();
  });

  rconCon.connect();
}

/*
 *  Helper functions
 *
 */

//accepts an array of objects and adds them together
mc.sumStats = function(stats){
  let finishedObject = {};
  for(let i = 0; i < stats.length; i++){
    for(topkey in stats[i]){
      if(!finishedObject.hasOwnProperty(topkey)) finishedObject[topkey] = {};
      for(key in stats[i][topkey]){
        finishedObject[topkey].hasOwnProperty(key) ? finishedObject[topkey][key] += stats[i][topkey][key] : finishedObject[topkey][key] = stats[i][topkey][key];
      }
    }
  }
  return finishedObject;
}

mc.convertUUIDtoWeirdFormat = function(uuid){
  var newUUID = '';
  for(var i = 0; i < 32; i++){
    newUUID += uuid[i];
    if(i == 7 || i == 11 || i == 15 || i == 19) newUUID += '-';
  }
  return newUUID;
};

mc.prettiyDistance = function(distance){
  var prettyDistance = '';

  //Are we in the centimeter range?
  if(distance < 100){
    prettyDistance = distance + 'cm';
  }else{
    //Are we in the meter range?
    if(distance < 99950){
      prettyDistance = Math.round(distance / 100) + 'm';
    }else{
      //We are in the kilometer range
      prettyDistance = Math.round(distance / 100 / 1000) + 'km';
    }
  }

  return prettyDistance;
};

mc.prettifyDuration = function(duration){
  var prettyDuration = Math.round(duration / 20 / 60 / 60) + 'h';
  return prettyDuration;
};

mc.sumOfObject = function(object){
  var sum = 0;

  for(let key in object){
    sum += object[key];
  }

  return sum;
};

mc.top10 = function(object){
  var values = [];
  var i = 0;

  //Fill array with an object for each key value pair
  for(let key in object){
    values[i] = {key: key, value: object[key]};
    i++;
  }

  //Sort array
  values.sort(function(a, b){
    return b.value - a.value
  });

  //Only use the top 10 values, discard the rest
  let top10Values = [];
  for(let j = 0; j < (10 <= values.length ? 10 : values.length); j++){
    top10Values[j] = values[j];
  }

  //Cut the minecraft: suffix off
  i = 0;
  top10Values.forEach((entry) => {
    top10Values[i] = {key: entry.key.replace('minecraft:', ''), value: entry.value};
    i++;
  });

  //Return the finished object
  return top10Values;
};

//Export the container
module.exports = mc;
