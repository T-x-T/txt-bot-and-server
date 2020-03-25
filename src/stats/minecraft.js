/*
 *  MINECRAFT STATS GETTERS
 *  Retrieval of stats from the database and filtering them after collections
 */

//Dependencies
const config = require('../../config.js');
const data = require('../data');
const user = require('../user');

//Create the container
var mc = {};

//Getters
mc.getRanked = function(collection, uuid, callback){
  getLatestStats(uuid, function(err, doc){
    if(!err && doc){
      //Get the collections data
      let stats = _statsTemplates[collection](doc);
  
      //Get stats from all players to create the ranking
      getLatestStats(false, function(err, docs){
        if(!err && docs){
          //Get the rank for each key in the stats
          let finalStats = {};
          for(let stat in stats){
            //Get an array of all users stat
            let allStats = [];
            for(let doc in docs){
              allStats.push(_statsTemplates.single(doc, stat));
            }

            //Sort the array
            allStats = allStats.sort(function(a, b){
              return b - a;
            });

            //Add the rank to the final array
            finalStats[stat] = {
              stat: stats[stat],
              rank: allStats.indexOf(parseInt(stats[stat])) + 1
            }
          }
        }else{
          callback('Couldnt get stats for all users: ' + err, false);
        }
      });
    }else{
      callback('Couldnt get stats for user: ' + uuid + err, false);
    }
  });
};

mc.getSingle = function(collection, uuid, callback){
  getLatestStats(uuid, function(err, doc){
    if(!err && doc){
      callback(_statsTemplates[collection](doc));
    }else{
      callback(err, false);
    }
  });
};

mc.getAll = function(collection, callback){
  getLatestStats(false, function(err, docs){
    console.log(err, docs)
    if(!err && docs){
      console.log(_statsTemplates[collection](sumArray(docs)))
      callback(false, _statsTemplates[collection](sumArray(docs)));
    }else{
      callback(err, false);
    }
  });
};

function sumArray(docs){
  let finishedObject = {};
  for(let i = 0; i < docs.length; i++){
    for(let topkey in docs[i]){
      if(!finishedObject.hasOwnProperty(topkey)) finishedObject[topkey] = {};
      for(let key in docs[i][topkey]){
        finishedObject[topkey].hasOwnProperty(key) ? finishedObject[topkey][key] += docs[i][topkey][key] : finishedObject[topkey][key] = docs[i][topkey][key];
      }
    }
  }
  return finishedObject;
}

function getLatestStats(uuid, callback){
  let filter = uuid ? {uuid: uuid} : {};
  if(uuid){
    data.get(filter, 'stats', {type: 'mc_stats', latest: true, first: true}, function(err, doc){
      if(Array.isArray(doc) && doc.length === 0){
        //No stats for this user
        callback('Couldnt get stats for user: ' + uuid, false);
      }else{
        if(!err) {
          callback(false, doc.stats.stats);
        } else {
          callback(err, false);
        }
      }
    });
  }else{
    user.get({}, {privacy: true, onlyPaxterians: true}, function(err, docs){
      if(!err && docs){
        let errored = false;
        let stats = [];
        for(let i = 0; i < docs.length; i++){
          getLatestStats(docs[i].mcUUID, function(err, doc){
            if(err) errored = err;
            if(doc) stats.push(doc);
            if(i == docs.length - 1) callback(errored, stats);
          });
        }
      }else{
        callback(err, false);
      }
    });
  }
};


//Collections
var _statsTemplates = {};

//Contains number of deaths, player kills, mob kills, playtime, Total distance by foot (walking + sprinting + crouching)
_statsTemplates.general = function(stats) {
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
_statsTemplates.distances = function(stats) {
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
};

//Contains mined ores (Diamond, Iron, Gold, Emerald, Coal, Lapis Lazuli, Redstone)
_statsTemplates.minedOres = function(stats) {
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

//Contains totals for blocks mined, items used, items crafted, items broken, items dropped, distance travelled
_statsTemplates.totals = function(stats) {
  let output = {};

  output.mined = mc.sumOfObject(stats['minecraft:mined']);
  output.used = mc.sumOfObject(stats['minecraft:used']);
  output.crafted = mc.sumOfObject(stats['minecraft:crafted']);
  output.broken = mc.sumOfObject(stats['minecraft:broken']);
  output.dropped = mc.sumOfObject(stats['minecraft:dropped']);
  output.picked_up = mc.sumOfObject(stats['minecraft:picked_up']);
  output.travelled = mc.prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'] + stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:climb_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:boat_one_cm'] + stats['minecraft:custom']['minecraft:swim_one_cm'] + stats['minecraft:custom']['minecraft:fly_one_cm'] + stats['minecraft:custom']['minecraft:aviate_one_cm'] + stats['minecraft:custom']['minecraft:fall_one_cm']);


  return output;
};

//Contains top 10 used items with number of times used
_statsTemplates.topUsageItems = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:used']);

  return output;
};

//Contains top 10 picked up items
_statsTemplates.topPickedUpItems = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:picked_up']);

  return output;
};

//Contains top 10 dropped items
_statsTemplates.topDroppedItems = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:dropped']);

  return output;
};

//Contains top 10 crafted items
_statsTemplates.topCraftedItems = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:crafted']);

  return output;
};

//Contains top 10 broken items
_statsTemplates.topBrokenItems = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:broken']);

  return output;
};

//Contains top 10 mined blocks with number of times mined
_statsTemplates.topMinedBlocks = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:mined']);

  return output;
};

//Contains top 10 killed mobs with number of times killed
_statsTemplates.topKilledMobs = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:killed']);

  return output;
};

//Contains top 10 caused of death with number of times died
_statsTemplates.topKilledByMobs = function(stats) {
  let output = {};

  output = mc.top10(stats['minecraft:killed_by']);

  return output;
};

//Contains some stats per death stats like k/d blocks mined per death, etc
_statsTemplates.totalPerDeath = function(stats) {
  let output = {};

  output.mined = Math.round(mc.sumOfObject(stats['minecraft:mined']) / stats['minecraft:custom']['minecraft:deaths']);
  output.used = Math.round(mc.sumOfObject(stats['minecraft:used']) / stats['minecraft:custom']['minecraft:deaths']);
  output.crafted = Math.round(mc.sumOfObject(stats['minecraft:crafted']) / stats['minecraft:custom']['minecraft:deaths']);
  output.broken = Math.round(mc.sumOfObject(stats['minecraft:broken']) / stats['minecraft:custom']['minecraft:deaths']);
  output.dropped = Math.round(mc.sumOfObject(stats['minecraft:dropped']) / stats['minecraft:custom']['minecraft:deaths']);
  output.picked_up = Math.round(mc.sumOfObject(stats['minecraft:picked_up']) / stats['minecraft:custom']['minecraft:deaths']);
  output.travelled = mc.prettiyDistance(Math.round((stats['minecraft:custom']['minecraft:sprint_one_cm'] + stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:climb_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:boat_one_cm'] + stats['minecraft:custom']['minecraft:swim_one_cm'] + stats['minecraft:custom']['minecraft:fly_one_cm'] + stats['minecraft:custom']['minecraft:aviate_one_cm'] + stats['minecraft:custom']['minecraft:fall_one_cm']) / stats['minecraft:custom']['minecraft:deaths']));

  return output;
};

//Contains only playtime
_statsTemplates.playtime = function(stats) {
  let output = {};

  output.playtime = mc.prettifyDuration(stats['minecraft:custom']['minecraft:play_one_minute']);

  return output;
};


//Export the container
module.exports = mc;