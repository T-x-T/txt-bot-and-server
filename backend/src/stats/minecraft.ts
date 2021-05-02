/*
 *  MINECRAFT STATS GETTERS
 *  Retrieval of stats from the database and filtering them after collections
 */

//Dependencies
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import Factory = require("../persistance/factory.js");
import mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;
import type Member = require("../user/member.js");

let schema = {
  timestamp: Date,
  sub_type: String,
  uuid: String,
  stats: Mixed
};

const statsFactory = new Factory({name: "mcstats", schema: schema});
statsFactory.connect();

const minecraft = {
  //Gets ranked stats for single player
  async getRanked(uuid: string, collection: string) {
    const stats = await minecraft.getSingle(uuid, collection);
    const allRawStats = await getAllLatestStats();
    
    //Create the object that will hold the final ranked data
    let finalStats: any = {};

    //Iterate over all single stats
    for(const key in stats) {
      //Put the each item of allRawStats through the singe template and into allStats
      let allStats: any[] = [];
      allRawStats.forEach((rawStat) => {
        if(rawStat['minecraft:mined']) {
          const stat = _statsTemplates.single[key](rawStat);
          if(!Number.isNaN(stat)) allStats.push(stat);
        }
      });

      //Sort that array
      allStats = allStats.sort(function (a, b) {
        return b - a;
      });

      //Get the rank for the current stat
      finalStats[key] = {
        stat: stats[key],
        rank: allStats.indexOf(parseInt(stats[key])) + 1
      };
    }
    //Finish the object and call it back
    finalStats._totalPlayers = allRawStats.length;
    return finalStats;
  },

  //Gets stats for single player
  async getSingle(uuid: string, collection: string) {
    try {
      const doc = await getLatestStatsByUuid(uuid);
      if(typeof _statsTemplates[collection] === 'function') {
        return _statsTemplates[collection](doc);
      } else {
        return _statsTemplates.single[collection](doc);
      }
    } catch(e) {
      return {}
    }
  },

  //Gets stats for all players combined
  async getAll(collection: string) {
    const docs = await getAllLatestStats();
    return typeof _statsTemplates[collection] === 'function' ? _statsTemplates[collection](sumArray(docs)) : _statsTemplates.single[collection](sumArray(docs));
  }
}

function sumArray(docs: any){
  let finishedObject: any = {};
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

async function getAllLatestStats() {
  const members: any = await memberFactory.getAllWhitelisted();
  const results: any = await Promise.allSettled(members.map(async (member: Member) => await getLatestStatsByUuid(member.getMcUuid())));
  const stats: any[] = [];
  results.forEach((res: any) => {
    if(res.status === "fulfilled") stats.push(res.value);
  });
  return stats;
}

async function getLatestStatsByUuid(uuid: string){
  const stats = await statsFactory.persistanceProvider.retrieveNewestFiltered({uuid: uuid});
  if(!stats) throw new Error("No stats received for " + uuid);
  return stats.stats.stats;
}

//Collections
var _statsTemplates: any = {};

//Contains number of deaths, player kills, mob kills, playtime, Total distance by foot (walking + sprinting + crouching)
_statsTemplates.general = function(stats: any) {
  return {
    deaths:         _statsTemplates.single.deaths(stats),
    playerKills:    _statsTemplates.single.playerKills(stats),
    mobKills:       _statsTemplates.single.mobKills(stats),
    damageDealt:    _statsTemplates.single.damageDealt(stats),
    damageTaken:    _statsTemplates.single.damageTaken(stats),
    playtime:       _statsTemplates.single.playtime(stats)       + 'h',
    distanceByFoot: _statsTemplates.single.distanceByFoot(stats) + 'km',
    jumps:          _statsTemplates.single.jumps(stats),
    animals_bred:   _statsTemplates.single.animals_bred(stats),
    times_slept:    _statsTemplates.single.times_slept(stats)
  };
};

//Contains all different distances (walking, sprinting, boat, pig, climb, fall, elytra, ...)
_statsTemplates.distances = function(stats: any) {
  return {
    distance_sprint:         _statsTemplates.single.distance_sprint(stats)         + 'km',
    distance_walkOnWater:    _statsTemplates.single.distance_walkOnWater(stats)    + 'km',
    distance_crouch:         _statsTemplates.single.distance_crouch(stats)         + 'km',
    distance_climb:          _statsTemplates.single.distance_climb(stats)          + 'km',
    distance_walk:           _statsTemplates.single.distance_walk(stats)           + 'km',
    distance_walkUnderWater: _statsTemplates.single.distance_walkUnderWater(stats) + 'km',
    distance_boat:           _statsTemplates.single.distance_boat(stats)           + 'km',
    distance_swim:           _statsTemplates.single.distance_swim(stats)           + 'km',
    distance_fly:            _statsTemplates.single.distance_fly(stats)            + 'km',
    distance_aviate:         _statsTemplates.single.distance_aviate(stats)         + 'km',
    distance_fall:           _statsTemplates.single.distance_fall(stats)           + 'km'
  };
};

//Contains mined ores (Diamond, Iron, Gold, Emerald, Coal, Lapis Lazuli, Redstone)
_statsTemplates.minedOres = function(stats: any) {
  return {
    mined_diamond_ore:     _statsTemplates.single.mined_diamond_ore(stats),
    mined_iron_ore:        _statsTemplates.single.mined_iron_ore(stats),
    mined_gold_ore:        _statsTemplates.single.mined_gold_ore(stats),
    mined_emerald_ore:     _statsTemplates.single.mined_emerald_ore(stats),
    mined_coal_ore:        _statsTemplates.single.mined_coal_ore(stats),
    mined_lapis_ore:       _statsTemplates.single.mined_lapis_ore(stats),
    mined_redstone_ore:    _statsTemplates.single.mined_redstone_ore(stats),
    mined_quartz_ore:      _statsTemplates.single.mined_quartz_ore(stats),
    mined_nether_gold_ore: _statsTemplates.single.mined_nether_gold_ore(stats),
    mined_ancient_debris:  _statsTemplates.single.mined_ancient_debris(stats)
  };
};

//Contains totals for blocks mined, items used, items crafted, items broken, items dropped, distance travelled
_statsTemplates.total = function(stats: any) {
  return {
    total_mined:     _statsTemplates.single.total_mined(stats),
    total_used:      _statsTemplates.single.total_used(stats),
    total_crafted:   _statsTemplates.single.total_crafted(stats),
    total_broken:    _statsTemplates.single.total_broken(stats),
    total_dropped:   _statsTemplates.single.total_dropped(stats),
    total_picked_up: _statsTemplates.single.total_picked_up(stats),
    total_travelled: _statsTemplates.single.total_travelled(stats) + 'km'
  };
};

//Contains top 10 used items with number of times used
_statsTemplates.topUsageItems = function(stats: any) {
  return top10(stats['minecraft:used']);
};

//Contains top 10 picked up items
_statsTemplates.topPickedUpItems = function(stats: any) {
  return top10(stats['minecraft:picked_up']);;
};

//Contains top 10 dropped items
_statsTemplates.topDroppedItems = function(stats: any) {
  return top10(stats['minecraft:dropped']);
};

//Contains top 10 crafted items
_statsTemplates.topCraftedItems = function(stats: any) {
  return top10(stats['minecraft:crafted']);
};

//Contains top 10 broken items
_statsTemplates.topBrokenItems = function(stats: any) {
  return top10(stats['minecraft:broken']);;
};

//Contains top 10 mined blocks with number of times mined
_statsTemplates.topMinedBlocks = function(stats: any) {
  return top10(stats['minecraft:mined']);
};

//Contains top 10 killed mobs with number of times killed
_statsTemplates.topKilledMobs = function(stats: any) {
  return top10(stats['minecraft:killed']);
};

//Contains top 10 caused of death with number of times died
_statsTemplates.topKilledByMobs = function(stats: any) {
  return top10(stats['minecraft:killed_by']);
};

//Contains some stats per death stats like k/d blocks mined per death, etc
_statsTemplates.totalPerDeath = function(stats: any) {
  return {
    total_per_death_mined:     _statsTemplates.single.total_per_death_mined(stats),
    total_per_death_used:      _statsTemplates.single.total_per_death_used(stats),
    total_per_death_crafted:   _statsTemplates.single.total_per_death_crafted(stats),
    total_per_death_broken:    _statsTemplates.single.total_per_death_broken(stats),
    total_per_death_dropped:   _statsTemplates.single.total_per_death_dropped(stats),
    total_per_death_picked_up: _statsTemplates.single.total_per_death_picked_up(stats),
    total_per_death_travelled: _statsTemplates.single.total_per_death_travelled(stats) + 'km'
  };
};

_statsTemplates.overview = function(stats: any) {
  return {
    cobblestone_mined_per_death_by_zombie: _statsTemplates.single.mined_cobblestone(stats) / _statsTemplates.single.killed_by_zombies(stats),
    playtime: _statsTemplates.single.playtime(stats)
  }
};

_statsTemplates.single = {};

_statsTemplates.single.playtime                  = function(stats: any) {return prettifyDuration(stats['minecraft:custom']['minecraft:play_one_minute'])        ? prettifyDuration(stats['minecraft:custom']['minecraft:play_one_minute'])        : 0 };
_statsTemplates.single.deaths                    = function(stats: any) {return stats['minecraft:custom']['minecraft:deaths']                                   ? stats['minecraft:custom']['minecraft:deaths']                                   : 0 };
_statsTemplates.single.killed_by_zombies         = function(stats: any) {return stats['minecraft:killed_by']['minecraft:zombie']                                ? stats['minecraft:killed_by']['minecraft:zombie']                                : 0 };
_statsTemplates.single.playerKills               = function(stats: any) {return stats['minecraft:custom']['minecraft:player_kills']                             ? stats['minecraft:custom']['minecraft:player_kills']                             : 0 };
_statsTemplates.single.mobKills                  = function(stats: any) {return stats['minecraft:custom']['minecraft:mob_kills']                                ? stats['minecraft:custom']['minecraft:mob_kills']                                : 0 };
_statsTemplates.single.damageDealt               = function(stats: any) {return stats['minecraft:custom']['minecraft:damage_dealt']                             ? stats['minecraft:custom']['minecraft:damage_dealt']                             : 0 };
_statsTemplates.single.damageTaken               = function(stats: any) {return stats['minecraft:custom']['minecraft:damage_taken']                             ? stats['minecraft:custom']['minecraft:damage_taken']                             : 0 };
_statsTemplates.single.distance_sprint           = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'])           ? prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'])           : 0 };
_statsTemplates.single.distance_walkOnWater      = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'])    ? prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'])    : 0 };
_statsTemplates.single.distance_crouch           = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:crouch_one_cm'])           ? prettiyDistance(stats['minecraft:custom']['minecraft:crouch_one_cm'])           : 0 };
_statsTemplates.single.distance_climb            = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:climb_one_cm'])            ? prettiyDistance(stats['minecraft:custom']['minecraft:climb_one_cm'])            : 0 };
_statsTemplates.single.distance_walk             = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:walk_one_cm'])             : 0 };
_statsTemplates.single.distance_walkUnderWater   = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_under_water_one_cm']) ? prettiyDistance(stats['minecraft:custom']['minecraft:walk_under_water_one_cm']) : 0 };
_statsTemplates.single.distance_boat             = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:boat_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:boat_one_cm'])             : 0 };
_statsTemplates.single.distance_swim             = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:swim_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:swim_one_cm'])             : 0 };
_statsTemplates.single.distance_fly              = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:fly_one_cm'])              ? prettiyDistance(stats['minecraft:custom']['minecraft:fly_one_cm'])              : 0 };
_statsTemplates.single.distance_aviate           = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:aviate_one_cm'])           ? prettiyDistance(stats['minecraft:custom']['minecraft:aviate_one_cm'])           : 0 };
_statsTemplates.single.distance_fall             = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:fall_one_cm'])             ? prettiyDistance(stats['minecraft:custom']['minecraft:fall_one_cm'])             : 0 };
_statsTemplates.single.mined_diamond_ore         = function(stats: any) {return stats['minecraft:mined']['minecraft:diamond_ore']                               ? stats['minecraft:mined']['minecraft:diamond_ore']                               : 0 };
_statsTemplates.single.mined_iron_ore            = function(stats: any) {return stats['minecraft:mined']['minecraft:iron_ore']                                  ? stats['minecraft:mined']['minecraft:iron_ore']                                  : 0 };
_statsTemplates.single.mined_gold_ore            = function(stats: any) {return stats['minecraft:mined']['minecraft:gold_ore']                                  ? stats['minecraft:mined']['minecraft:gold_ore']                                  : 0 };
_statsTemplates.single.mined_emerald_ore         = function(stats: any) {return stats['minecraft:mined']['minecraft:emerald_ore']                               ? stats['minecraft:mined']['minecraft:emerald_ore']                               : 0 };
_statsTemplates.single.mined_coal_ore            = function(stats: any) {return stats['minecraft:mined']['minecraft:coal_ore']                                  ? stats['minecraft:mined']['minecraft:coal_ore']                                  : 0 };
_statsTemplates.single.mined_lapis_ore           = function(stats: any) {return stats['minecraft:mined']['minecraft:lapis_ore']                                 ? stats['minecraft:mined']['minecraft:lapis_ore']                                 : 0 };
_statsTemplates.single.mined_redstone_ore        = function(stats: any) {return stats['minecraft:mined']['minecraft:redstone_ore']                              ? stats['minecraft:mined']['minecraft:redstone_ore']                              : 0 };
_statsTemplates.single.mined_quartz_ore          = function(stats: any) {return stats['minecraft:mined']['minecraft:nether_quartz_ore']                         ? stats['minecraft:mined']['minecraft:nether_quartz_ore']                         : 0 };
_statsTemplates.single.mined_nether_gold_ore     = function(stats: any) {return stats['minecraft:mined']['minecraft:nether_gold_ore']                           ? stats['minecraft:mined']['minecraft:nether_gold_ore']                           : 0 };
_statsTemplates.single.mined_ancient_debris      = function(stats: any) {return stats['minecraft:mined']['minecraft:ancient_debris']                            ? stats['minecraft:mined']['minecraft:ancient_debris']                            : 0 };
_statsTemplates.single.mined_cobblestone         = function(stats: any) {return stats['minecraft:mined']['minecraft:cobblestone']                               ? stats['minecraft:mined']['minecraft:cobblestone']                               : 0 };
_statsTemplates.single.total_mined               = function(stats: any) {return sumOfObject(stats['minecraft:mined'])                                           ? sumOfObject(stats['minecraft:mined'])                                           : 0 };
_statsTemplates.single.total_used                = function(stats: any) {return sumOfObject(stats['minecraft:used'])                                            ? sumOfObject(stats['minecraft:used'])                                            : 0 };
_statsTemplates.single.total_crafted             = function(stats: any) {return sumOfObject(stats['minecraft:crafted'])                                         ? sumOfObject(stats['minecraft:crafted'])                                         : 0 };
_statsTemplates.single.total_broken              = function(stats: any) {return sumOfObject(stats['minecraft:broken'])                                          ? sumOfObject(stats['minecraft:broken'])                                          : 0 };
_statsTemplates.single.total_dropped             = function(stats: any) {return sumOfObject(stats['minecraft:dropped'])                                         ? sumOfObject(stats['minecraft:dropped'])                                         : 0 };
_statsTemplates.single.total_picked_up           = function(stats: any) {return sumOfObject(stats['minecraft:picked_up'])                                       ? sumOfObject(stats['minecraft:picked_up'])                                       : 0 };
_statsTemplates.single.times_slept               = function(stats: any) {return stats['minecraft:custom']['minecraft:sleep_in_bed']                             ? stats['minecraft:custom']['minecraft:sleep_in_bed']                             : 0 };
_statsTemplates.single.jumps                     = function(stats: any) {return stats['minecraft:custom']['minecraft:jump']                                     ? stats['minecraft:custom']['minecraft:jump']                                     : 0 };
_statsTemplates.single.animals_bred              = function(stats: any) {return stats['minecraft:custom']['minecraft:animals_bred']                             ? stats['minecraft:custom']['minecraft:animals_bred']                             : 0 };
_statsTemplates.single.distanceByFoot            = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:sprint_one_cm']);};
_statsTemplates.single.total_travelled           = function(stats: any) {return prettiyDistance(stats['minecraft:custom']['minecraft:sprint_one_cm'] + stats['minecraft:custom']['minecraft:walk_on_water_one_cm'] + stats['minecraft:custom']['minecraft:crouch_one_cm'] + stats['minecraft:custom']['minecraft:climb_one_cm'] + stats['minecraft:custom']['minecraft:walk_one_cm'] + stats['minecraft:custom']['minecraft:walk_under_water_one_cm'] + stats['minecraft:custom']['minecraft:boat_one_cm'] + stats['minecraft:custom']['minecraft:swim_one_cm'] + stats['minecraft:custom']['minecraft:fly_one_cm'] + stats['minecraft:custom']['minecraft:aviate_one_cm'] + stats['minecraft:custom']['minecraft:fall_one_cm']);};
_statsTemplates.single.total_per_death_mined     = function(stats: any) {return Math.round(_statsTemplates.single.total_mined(stats)     / _statsTemplates.single.deaths(stats))};      
_statsTemplates.single.total_per_death_used      = function(stats: any) {return Math.round(_statsTemplates.single.total_used(stats)      / _statsTemplates.single.deaths(stats))};
_statsTemplates.single.total_per_death_crafted   = function(stats: any) {return Math.round(_statsTemplates.single.total_crafted(stats)   / _statsTemplates.single.deaths(stats))};
_statsTemplates.single.total_per_death_broken    = function(stats: any) {return Math.round(_statsTemplates.single.total_broken(stats)    / _statsTemplates.single.deaths(stats))};
_statsTemplates.single.total_per_death_dropped   = function(stats: any) {return Math.round(_statsTemplates.single.total_dropped(stats)   / _statsTemplates.single.deaths(stats))};
_statsTemplates.single.total_per_death_picked_up = function(stats: any) {return Math.round(_statsTemplates.single.total_picked_up(stats) / _statsTemplates.single.deaths(stats))};
_statsTemplates.single.total_per_death_travelled = function(stats: any) {return Math.round(_statsTemplates.single.total_travelled(stats) / _statsTemplates.single.deaths(stats))};

//Helper functions for formatting stats

function prettifyDuration(duration: number) {
  return Math.round(duration / 20 / 60 / 60);
};

function prettiyDistance(distance: number) {
  return Math.round(distance / 100 / 1000);
};

function sumOfObject(object: any) {
  var sum = 0;

  for(let key in object) {
    sum += object[key];
  }

  return sum;
};

function top10(object: any) {
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

export = minecraft;