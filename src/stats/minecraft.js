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
mc.getRanked = function(options, callback){
  getLatestStats(options.uuid, function(err, doc){
    if(!err && doc){
      //Get the collections data
      let stats = _statsTemplates[options.collection](doc);
  
      //Get stats from all players to create the ranking
      getLatestStats(false, function(err, docs) {
        if(!err && docs) {
          //Get the rank for each key in the stats
          let finalStats = {};
          let allStats = [];
          docs.forEach((doc) => {
            allStats.push(_statsTemplates[options.collection](doc));
          });
          //Get an array of all users stat
          for(let key in stats) {
            //Build a new array that only contains all values for the current stat
            let curAllStat = [];
            allStats.forEach((cur) => {
              if(typeof cur[key] == 'undefined') cur[key] = 0;
              curAllStat.push(parseInt(cur[key]));
            });
            //Sort that array
            curAllStat = curAllStat.sort(function(a, b) {
              return b - a;
            });
            //Get the rank for the given player and build the finished object
            finalStats[key] = {
              stat: stats[key],
              rank: curAllStat.indexOf(parseInt(stats[key])) + 1
            };
          }
          finalStats._totalPlayers = allStats.length;
          callback(false, finalStats);
        } else {
          callback('Couldnt get stats for all users: ' + err, false);
        }
      });
    }else{
      callback('Couldnt get stats for user: ' + uuid + err, false);
    }
  });
};

mc.getSingle = function(options, callback){
  getLatestStats(options.uuid, function(err, doc){
    if(!err && doc){
      callback(false, _statsTemplates[options.collection](doc));
    }else{
      callback(err, false);
    }
  });
};

mc.getAll = function(options, callback){
  getLatestStats(false, function(err, docs){
    if(!err && docs){
      let data = typeof _statsTemplates[options.collection] === 'function' ? _statsTemplates[options.collection](sumArray(docs)) : _statsTemplates.single[options.collection](sumArray(docs));
      callback(false, data);
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
    data.get(filter, 'stats', {sub_type: 'mc_stats', latest: true, first: true}, function(err, doc){
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
        let stats = [];
        for(let i = 0; i < docs.length; i++){
          getLatestStats(docs[i].mcUUID, function(err, doc){
            stats.push(doc);
            if(stats.length == docs.length){
              callback(false, stats);
            } 
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
  return {
    deaths:         _statsTemplates.single.deaths(stats),
    playerKills:    _statsTemplates.single.playerKills(stats),
    mobKills:       _statsTemplates.single.mobKills(stats),
    damageDealt:    _statsTemplates.single.damageDealt(stats),
    damageTaken:    _statsTemplates.single.damageTaken(stats),
    playtime:       _statsTemplates.single.playtime(stats)       + 'h',
    distanceByFoot: _statsTemplates.single.distanceByFoot(stats) + 'km'
  };
};

//Contains all different distances (walking, sprinting, boat, pig, climb, fall, elytra, ...)
_statsTemplates.distances = function(stats) {
  return {
    sprint:         _statsTemplates.single.distance_sprint(stats)         + 'km',
    walkOnWater:    _statsTemplates.single.distance_walkOnWater(stats)    + 'km',
    crouch:         _statsTemplates.single.distance_crouch(stats)         + 'km',
    climb:          _statsTemplates.single.distance_climb(stats)          + 'km',
    walk:           _statsTemplates.single.distance_walk(stats)           + 'km',
    walkUnderWater: _statsTemplates.single.distance_walkUnderWater(stats) + 'km',
    boat:           _statsTemplates.single.distance_boat(stats)           + 'km',
    swim:           _statsTemplates.single.distance_swim(stats)           + 'km',
    fly:            _statsTemplates.single.distance_fly(stats)            + 'km',
    aviate:         _statsTemplates.single.distance_aviate(stats)         + 'km',
    fall:           _statsTemplates.single.distance_fall(stats)           + 'km'
  };
};

//Contains mined ores (Diamond, Iron, Gold, Emerald, Coal, Lapis Lazuli, Redstone)
_statsTemplates.minedOres = function(stats) {
  return {
    diamond:  _statsTemplates.single.mined_diamond_ore(stats),
    iron:     _statsTemplates.single.mined_iron_ore(stats),
    gold:     _statsTemplates.single.mined_gold_ore(stats),
    emerald:  _statsTemplates.single.mined_emerald_ore(stats),
    coal:     _statsTemplates.single.mined_coal_ore(stats),
    lapis:    _statsTemplates.single.mined_lapis_ore(stats),
    redstone: _statsTemplates.single.mined_redstone_ore(stats)
  };
};

//Contains totals for blocks mined, items used, items crafted, items broken, items dropped, distance travelled
_statsTemplates.total = function(stats) {
  return {
    mined:     _statsTemplates.single.total_mined(stats),
    used:      _statsTemplates.single.total_used(stats),
    crafted:   _statsTemplates.single.total_crafted(stats),
    broken:    _statsTemplates.single.total_broken(stats),
    dropped:   _statsTemplates.single.total_dropped(stats),
    picked_up: _statsTemplates.single.total_picked_up(stats),
    travelled: _statsTemplates.single.total_travelled(stats) + 'km'
  };
};

//Contains top 10 used items with number of times used
_statsTemplates.topUsageItems = function(stats) {
  return top10(stats['minecraft:used']);
};

//Contains top 10 picked up items
_statsTemplates.topPickedUpItems = function(stats) {
  return top10(stats['minecraft:picked_up']);;
};

//Contains top 10 dropped items
_statsTemplates.topDroppedItems = function(stats) {
  return top10(stats['minecraft:dropped']);
};

//Contains top 10 crafted items
_statsTemplates.topCraftedItems = function(stats) {
  return top10(stats['minecraft:crafted']);
};

//Contains top 10 broken items
_statsTemplates.topBrokenItems = function(stats) {
  return top10(stats['minecraft:broken']);;
};

//Contains top 10 mined blocks with number of times mined
_statsTemplates.topMinedBlocks = function(stats) {
  return top10(stats['minecraft:mined']);
};

//Contains top 10 killed mobs with number of times killed
_statsTemplates.topKilledMobs = function(stats) {
  return top10(stats['minecraft:killed']);
};

//Contains top 10 caused of death with number of times died
_statsTemplates.topKilledByMobs = function(stats) {
  return top10(stats['minecraft:killed_by']);
};

//Contains some stats per death stats like k/d blocks mined per death, etc
_statsTemplates.totalPerDeath = function(stats) {
  return {
    mined:     Math.round(_statsTemplates.single.total_mined(stats)     / _statsTemplates.single.deaths(stats)),
    used:      Math.round(_statsTemplates.single.total_used(stats)      / _statsTemplates.single.deaths(stats)),
    crafted:   Math.round(_statsTemplates.single.total_crafted(stats)   / _statsTemplates.single.deaths(stats)),
    broken:    Math.round(_statsTemplates.single.total_broken(stats)    / _statsTemplates.single.deaths(stats)),
    dropped:   Math.round(_statsTemplates.single.total_dropped(stats)   / _statsTemplates.single.deaths(stats)),
    picked_up: Math.round(_statsTemplates.single.total_picked_up(stats) / _statsTemplates.single.deaths(stats)),
    travelled: Math.round(_statsTemplates.single.total_travelled(stats) / _statsTemplates.single.deaths(stats)) + 'km'
  };
};

_statsTemplates.single = {};

_statsTemplates.single.playtime                = function(stats) {return prettifyDuration(stats['minecraft:custom']['minecraft:play_one_minute'])        ? prettifyDuration(stats['minecraft:custom']['minecraft:play_one_minute'])        : 0 };
_statsTemplates.single.deaths                  = function(stats) {return stats['minecraft:custom']['minecraft:deaths']                                   ? stats['minecraft:custom']['minecraft:deaths']                                   : 0 };
_statsTemplates.single.playerKills             = function(stats) {return stats['minecraft:custom']['minecraft:player_kills']                             ? stats['minecraft:custom']['minecraft:player_kills']                             : 0 };
_statsTemplates.single.mobKills                = function(stats) {return stats['minecraft:custom']['minecraft:mob_kills']                                ? stats['minecraft:custom']['minecraft:mob_kills']                                : 0 };
_statsTemplates.single.damageDealt             = function(stats) {return stats['minecraft:custom']['minecraft:damage_dealt']                             ? stats['minecraft:custom']['minecraft:damage_dealt']                             : 0 };
_statsTemplates.single.damageTaken             = function(stats) {return stats['minecraft:custom']['minecraft:damage_taken']                             ? stats['minecraft:custom']['minecraft:damage_taken']                             : 0 };
_statsTemplates.single.distance_sprint         = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'])           ? prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'])           : 0 };
_statsTemplates.single.distance_walkOnWater    = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'])    ? prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'])    : 0 };
_statsTemplates.single.distance_crouch         = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:crouch_one_cm'])           ? prettiyDistance(stats['minecraft:custom']['minecraft:crouch_one_cm'])           : 0 };
_statsTemplates.single.distance_climb          = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:climb_one_cm'])            ? prettiyDistance(stats['minecraft:custom']['minecraft:climb_one_cm'])            : 0 };
_statsTemplates.single.distance_walk           = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:walk_one_cm'])             : 0 };
_statsTemplates.single.distance_walkUnderWater = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_under_water_one_cm']) ? prettiyDistance(stats['minecraft:custom']['minecraft:walk_under_water_one_cm']) : 0 };
_statsTemplates.single.distance_boat           = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:boat_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:boat_one_cm'])             : 0 };
_statsTemplates.single.distance_swim           = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:swim_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:swim_one_cm'])             : 0 };
_statsTemplates.single.distance_fly            = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:fly_one_cm'])              ? prettiyDistance(stats['minecraft:custom']['minecraft:fly_one_cm'])              : 0 };
_statsTemplates.single.distance_aviate         = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:aviate_one_cm'])           ? prettiyDistance(stats['minecraft:custom']['minecraft:aviate_one_cm'])           : 0 };
_statsTemplates.single.distance_fall           = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:fall_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:fall_one_cm'])             : 0 };
_statsTemplates.single.mined_diamond_ore       = function(stats) {return stats['minecraft:mined']['minecraft:diamond_ore']                               ? stats['minecraft:mined']['minecraft:diamond_ore']                               : 0 };
_statsTemplates.single.mined_iron_ore          = function(stats) {return stats['minecraft:mined']['minecraft:iron_ore']                                  ? stats['minecraft:mined']['minecraft:iron_ore']                                  : 0 };
_statsTemplates.single.mined_gold_ore          = function(stats) {return stats['minecraft:mined']['minecraft:gold_ore']                                  ? stats['minecraft:mined']['minecraft:gold_ore']                                  : 0 };
_statsTemplates.single.mined_emerald_ore       = function(stats) {return stats['minecraft:mined']['minecraft:emerald_ore']                               ? stats['minecraft:mined']['minecraft:emerald_ore']                               : 0 };
_statsTemplates.single.mined_coal_ore          = function(stats) {return stats['minecraft:mined']['minecraft:coal_ore']                                  ? stats['minecraft:mined']['minecraft:coal_ore']                                  : 0 };
_statsTemplates.single.mined_lapis_ore         = function(stats) {return stats['minecraft:mined']['minecraft:lapis_ore']                                 ? stats['minecraft:mined']['minecraft:lapis_ore']                                 : 0 };
_statsTemplates.single.mined_redstone_ore      = function(stats) {return stats['minecraft:mined']['minecraft:redstone_ore']                              ? stats['minecraft:mined']['minecraft:redstone_ore']                              : 0 };
_statsTemplates.single.total_mined             = function(stats) {return sumOfObject(stats['minecraft:mined'])                                           ? sumOfObject(stats['minecraft:mined'])                                           : 0 };
_statsTemplates.single.total_used              = function(stats) {return sumOfObject(stats['minecraft:used'])                                            ? sumOfObject(stats['minecraft:used'])                                            : 0 };
_statsTemplates.single.total_crafted           = function(stats) {return sumOfObject(stats['minecraft:crafted'])                                         ? sumOfObject(stats['minecraft:crafted'])                                         : 0 };
_statsTemplates.single.total_broken            = function(stats) {return sumOfObject(stats['minecraft:broken'])                                          ? sumOfObject(stats['minecraft:broken'])                                          : 0 };
_statsTemplates.single.total_dropped           = function(stats) {return sumOfObject(stats['minecraft:dropped'])                                         ? sumOfObject(stats['minecraft:dropped'])                                         : 0 };
_statsTemplates.single.total_picked_up         = function(stats) {return sumOfObject(stats['minecraft:picked_up'])                                       ? sumOfObject(stats['minecraft:picked_up'])                                       : 0 };
_statsTemplates.single.distanceByFoot          = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:sprint_one_cm']);};
_statsTemplates.single.total_travelled         = function(stats) {return prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'] + stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:climb_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:boat_one_cm'] + stats['minecraft:custom']['minecraft:swim_one_cm'] + stats['minecraft:custom']['minecraft:fly_one_cm'] + stats['minecraft:custom']['minecraft:aviate_one_cm'] + stats['minecraft:custom']['minecraft:fall_one_cm']);};

//Helper functions for formatting stats

function prettifyDuration(duration) {
  return Math.round(duration / 20 / 60 / 60);
};

function prettiyDistance(distance) {
  return Math.round(distance / 100 / 1000);
};

function sumOfObject(object) {
  var sum = 0;

  for(let key in object) {
    sum += object[key];
  }

  return sum;
};

function top10(object) {
  var values = [];
  var i = 0;

  //Fill array with an object for each key value pair
  for(let key in object) {
    values[i] = {key: key, value: object[key]};
    i++;
  }

  //Sort array
  values.sort(function(a, b) {
    return b.value - a.value
  });

  //Only use the top 10 values, discard the rest
  let top10Values = [];
  for(let j = 0;j < (10 <= values.length ? 10 : values.length);j++) {
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