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

interface IStatsObject {
  [key: string]: {
    [key: string]: any
  }
}

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
        if(rawStat["minecraft:mined"]) {
          const stat = (_statsTemplates as any).single[key](rawStat);
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
    const doc = await getLatestStatsByUuid(uuid);
    return typeof (_statsTemplates as any)[collection] === "function" ? (_statsTemplates as any)[collection](doc) : (_statsTemplates as any).single[collection](doc);
  },

  //Gets stats for all players combined
  async getAll(collection: string) {
    const docs = await getAllLatestStats();
    return typeof (_statsTemplates as any)[collection] === "function" ? (_statsTemplates as any)[collection](sumArray(docs)) : (_statsTemplates as any).single[collection](sumArray(docs));
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
  const stats = await statsFactory.persistanceProvider.retrieveNewestFiltered({$and: [{uuid: uuid}, {sub_type: "s6"}]});
  if(!stats) throw new Error("No stats received for " + uuid);
  return stats.stats.stats;
}

//Collections
const _statsTemplates = {
  //Contains number of deaths, player kills, mob kills, playtime, Total distance by foot (walking + sprinting + crouching)
  general(stats: IStatsObject) {
    return {
      deaths:         _statsTemplates.single.deaths(stats),
      playerKills:    _statsTemplates.single.playerKills(stats),
      mobKills:       _statsTemplates.single.mobKills(stats),
      damageDealt:    _statsTemplates.single.damageDealt(stats),
      damageTaken:    _statsTemplates.single.damageTaken(stats),
      playtime:       _statsTemplates.single.playtime(stats)       + "h",
      distanceByFoot: _statsTemplates.single.distanceByFoot(stats) + "km",
      jumps:          _statsTemplates.single.jumps(stats),
      animals_bred:   _statsTemplates.single.animals_bred(stats),
      times_slept:    _statsTemplates.single.times_slept(stats)
    };
  },

  //Contains all different distances (walking, sprinting, boat, pig, climb, fall, elytra, ...)
  distances(stats: IStatsObject) {
    return {
      distance_sprint:         _statsTemplates.single.distance_sprint(stats)         + "km",
      distance_walkOnWater:    _statsTemplates.single.distance_walkOnWater(stats)    + "km",
      distance_crouch:         _statsTemplates.single.distance_crouch(stats)         + "km",
      distance_climb:          _statsTemplates.single.distance_climb(stats)          + "km",
      distance_walk:           _statsTemplates.single.distance_walk(stats)           + "km",
      distance_walkUnderWater: _statsTemplates.single.distance_walkUnderWater(stats) + "km",
      distance_boat:           _statsTemplates.single.distance_boat(stats)           + "km",
      distance_swim:           _statsTemplates.single.distance_swim(stats)           + "km",
      distance_fly:            _statsTemplates.single.distance_fly(stats)            + "km",
      distance_aviate:         _statsTemplates.single.distance_aviate(stats)         + "km",
      distance_fall:           _statsTemplates.single.distance_fall(stats)           + "km"
    };
  },

  //Contains mined ores (Diamond, Iron, Gold, Emerald, Coal, Lapis Lazuli, Redstone)
  minedOres(stats: IStatsObject) {
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
  },

  //Contains totals for blocks mined, items used, items crafted, items broken, items dropped, distance travelled
  total(stats: IStatsObject) {
    return {
      total_mined:     _statsTemplates.single.total_mined(stats),
      total_used:      _statsTemplates.single.total_used(stats),
      total_crafted:   _statsTemplates.single.total_crafted(stats),
      total_broken:    _statsTemplates.single.total_broken(stats),
      total_dropped:   _statsTemplates.single.total_dropped(stats),
      total_picked_up: _statsTemplates.single.total_picked_up(stats),
      total_travelled: _statsTemplates.single.total_travelled(stats) + "km"
    };
  },

  //Contains top 10 used items with number of times used
  topUsageItems(stats: IStatsObject) {
    return top10(stats["minecraft:used"]);
  },

  //Contains top 10 picked up items
  topPickedUpItems(stats: IStatsObject) {
    return top10(stats["minecraft:picked_up"]);;
  },

  //Contains top 10 dropped items
  topDroppedItems(stats: IStatsObject) {
    return top10(stats["minecraft:dropped"]);
  },

  //Contains top 10 crafted items
  topCraftedItems(stats: IStatsObject) {
    return top10(stats["minecraft:crafted"]);
  },

  //Contains top 10 broken items
  topBrokenItems(stats: IStatsObject) {
    return top10(stats["minecraft:broken"]);;
  },

  //Contains top 10 mined blocks with number of times mined
  topMinedBlocks(stats: IStatsObject) {
    return top10(stats["minecraft:mined"]);
  },

  //Contains top 10 killed mobs with number of times killed
  topKilledMobs(stats: IStatsObject) {
    return top10(stats["minecraft:killed"]);
  },

  //Contains top 10 caused of death with number of times died
  topKilledByMobs(stats: IStatsObject) {
    return top10(stats["minecraft:killed_by"]);
  },


  //Contains some stats per death stats like k/d blocks mined per death, etc
  totalPerDeath(stats: IStatsObject) {
    return {
      total_per_death_mined:     _statsTemplates.single.total_per_death_mined(stats),
      total_per_death_used:      _statsTemplates.single.total_per_death_used(stats),
      total_per_death_crafted:   _statsTemplates.single.total_per_death_crafted(stats),
      total_per_death_broken:    _statsTemplates.single.total_per_death_broken(stats),
      total_per_death_dropped:   _statsTemplates.single.total_per_death_dropped(stats),
      total_per_death_picked_up: _statsTemplates.single.total_per_death_picked_up(stats),
      total_per_death_travelled: _statsTemplates.single.total_per_death_travelled(stats) + "km"
    };
  },

  overview(stats: IStatsObject) {
    return {
      cobblestone_mined_per_death_by_zombie: _statsTemplates.single.mined_cobblestone(stats) / _statsTemplates.single.killed_by_zombies(stats),
      playtime: _statsTemplates.single.playtime(stats)
    }
  },

  single: {
    playtime(stats: IStatsObject)                  {return prettifyDuration(stats["minecraft:custom"]["minecraft:play_time"])              ? prettifyDuration(stats["minecraft:custom"]["minecraft:play_time"])              : 0 },
    deaths(stats: IStatsObject)                    {return stats["minecraft:custom"]["minecraft:deaths"]                                   ? stats["minecraft:custom"]["minecraft:deaths"]                                   : 0 },
    killed_by_zombies(stats: IStatsObject)         {return stats["minecraft:killed_by"]["minecraft:zombie"]                                ? stats["minecraft:killed_by"]["minecraft:zombie"]                                : 0 },
    playerKills(stats: IStatsObject)               {return stats["minecraft:custom"]["minecraft:player_kills"]                             ? stats["minecraft:custom"]["minecraft:player_kills"]                             : 0 },
    mobKills(stats: IStatsObject)                  {return stats["minecraft:custom"]["minecraft:mob_kills"]                                ? stats["minecraft:custom"]["minecraft:mob_kills"]                                : 0 },
    damageDealt(stats: IStatsObject)               {return stats["minecraft:custom"]["minecraft:damage_dealt"]                             ? stats["minecraft:custom"]["minecraft:damage_dealt"]                             : 0 },
    damageTaken(stats: IStatsObject)               {return stats["minecraft:custom"]["minecraft:damage_taken"]                             ? stats["minecraft:custom"]["minecraft:damage_taken"]                             : 0 },
    distance_sprint(stats: IStatsObject)           {return prettiyDistance(stats["minecraft:custom"]["minecraft:sprint_one_cm"])           ? prettiyDistance(stats["minecraft:custom"]["minecraft:sprint_one_cm"])           : 0 },
    distance_walkOnWater(stats: IStatsObject)      {return prettiyDistance(stats["minecraft:custom"]["minecraft:walk_on_water_one_cm"])    ? prettiyDistance(stats["minecraft:custom"]["minecraft:walk_on_water_one_cm"])    : 0 },
    distance_crouch(stats: IStatsObject)           {return prettiyDistance(stats["minecraft:custom"]["minecraft:crouch_one_cm"])           ? prettiyDistance(stats["minecraft:custom"]["minecraft:crouch_one_cm"])           : 0 },
    distance_climb(stats: IStatsObject)            {return prettiyDistance(stats["minecraft:custom"]["minecraft:climb_one_cm"])            ? prettiyDistance(stats["minecraft:custom"]["minecraft:climb_one_cm"])            : 0 },
    distance_walk(stats: IStatsObject)             {return prettiyDistance(stats["minecraft:custom"]["minecraft:walk_one_cm"])             ? prettiyDistance(stats["minecraft:custom"]["minecraft:walk_one_cm"])             : 0 },
    distance_walkUnderWater(stats: IStatsObject)   {return prettiyDistance(stats["minecraft:custom"]["minecraft:walk_under_water_one_cm"]) ? prettiyDistance(stats["minecraft:custom"]["minecraft:walk_under_water_one_cm"]) : 0 },
    distance_boat(stats: IStatsObject)             {return prettiyDistance(stats["minecraft:custom"]["minecraft:boat_one_cm"])             ? prettiyDistance(stats["minecraft:custom"]["minecraft:boat_one_cm"])             : 0 },
    distance_swim(stats: IStatsObject)             {return prettiyDistance(stats["minecraft:custom"]["minecraft:swim_one_cm"])             ? prettiyDistance(stats["minecraft:custom"]["minecraft:swim_one_cm"])             : 0 },
    distance_fly(stats: IStatsObject)              {return prettiyDistance(stats["minecraft:custom"]["minecraft:fly_one_cm"])              ? prettiyDistance(stats["minecraft:custom"]["minecraft:fly_one_cm"])              : 0 },
    distance_aviate(stats: IStatsObject)           {return prettiyDistance(stats["minecraft:custom"]["minecraft:aviate_one_cm"])           ? prettiyDistance(stats["minecraft:custom"]["minecraft:aviate_one_cm"])           : 0 },
    distance_fall(stats: IStatsObject)             {return prettiyDistance(stats["minecraft:custom"]["minecraft:fall_one_cm"])             ? prettiyDistance(stats["minecraft:custom"]["minecraft:fall_one_cm"])             : 0 },
    mined_diamond_ore(stats: IStatsObject)         {return stats["minecraft:mined"]["minecraft:diamond_ore"]                               ? stats["minecraft:mined"]["minecraft:diamond_ore"]                               : 0 },
    mined_iron_ore(stats: IStatsObject)            {return stats["minecraft:mined"]["minecraft:iron_ore"]                                  ? stats["minecraft:mined"]["minecraft:iron_ore"]                                  : 0 },
    mined_gold_ore(stats: IStatsObject)            {return stats["minecraft:mined"]["minecraft:gold_ore"]                                  ? stats["minecraft:mined"]["minecraft:gold_ore"]                                  : 0 },
    mined_emerald_ore(stats: IStatsObject)         {return stats["minecraft:mined"]["minecraft:emerald_ore"]                               ? stats["minecraft:mined"]["minecraft:emerald_ore"]                               : 0 },
    mined_coal_ore(stats: IStatsObject)            {return stats["minecraft:mined"]["minecraft:coal_ore"]                                  ? stats["minecraft:mined"]["minecraft:coal_ore"]                                  : 0 },
    mined_lapis_ore(stats: IStatsObject)           {return stats["minecraft:mined"]["minecraft:lapis_ore"]                                 ? stats["minecraft:mined"]["minecraft:lapis_ore"]                                 : 0 },
    mined_redstone_ore(stats: IStatsObject)        {return stats["minecraft:mined"]["minecraft:redstone_ore"]                              ? stats["minecraft:mined"]["minecraft:redstone_ore"]                              : 0 },
    mined_quartz_ore(stats: IStatsObject)          {return stats["minecraft:mined"]["minecraft:nether_quartz_ore"]                         ? stats["minecraft:mined"]["minecraft:nether_quartz_ore"]                         : 0 },
    mined_nether_gold_ore(stats: IStatsObject)     {return stats["minecraft:mined"]["minecraft:nether_gold_ore"]                           ? stats["minecraft:mined"]["minecraft:nether_gold_ore"]                           : 0 },
    mined_ancient_debris(stats: IStatsObject)      {return stats["minecraft:mined"]["minecraft:ancient_debris"]                            ? stats["minecraft:mined"]["minecraft:ancient_debris"]                            : 0 },
    mined_cobblestone(stats: IStatsObject)         {return stats["minecraft:mined"]["minecraft:cobblestone"]                               ? stats["minecraft:mined"]["minecraft:cobblestone"]                               : 0 },
    total_mined(stats: IStatsObject)               {return sumOfObject(stats["minecraft:mined"])                                           ? sumOfObject(stats["minecraft:mined"])                                           : 0 },
    total_used(stats: IStatsObject)                {return sumOfObject(stats["minecraft:used"])                                            ? sumOfObject(stats["minecraft:used"])                                            : 0 },
    total_crafted(stats: IStatsObject)             {return sumOfObject(stats["minecraft:crafted"])                                         ? sumOfObject(stats["minecraft:crafted"])                                         : 0 },
    total_broken(stats: IStatsObject)              {return sumOfObject(stats["minecraft:broken"])                                          ? sumOfObject(stats["minecraft:broken"])                                          : 0 },
    total_dropped(stats: IStatsObject)             {return sumOfObject(stats["minecraft:dropped"])                                         ? sumOfObject(stats["minecraft:dropped"])                                         : 0 },
    total_picked_up(stats: IStatsObject)           {return sumOfObject(stats["minecraft:picked_up"])                                       ? sumOfObject(stats["minecraft:picked_up"])                                       : 0 },
    times_slept(stats: IStatsObject)               {return stats["minecraft:custom"]["minecraft:sleep_in_bed"]                             ? stats["minecraft:custom"]["minecraft:sleep_in_bed"]                             : 0 },
    jumps(stats: IStatsObject)                     {return stats["minecraft:custom"]["minecraft:jump"]                                     ? stats["minecraft:custom"]["minecraft:jump"]                                     : 0 },
    animals_bred(stats: IStatsObject)              {return stats["minecraft:custom"]["minecraft:animals_bred"]                             ? stats["minecraft:custom"]["minecraft:animals_bred"]                             : 0 },
    distanceByFoot(stats: IStatsObject)            {return prettiyDistance(stats["minecraft:custom"]["minecraft:walk_on_water_one_cm"] + stats["minecraft:custom"]["minecraft:crouch_one_cm"] + stats["minecraft:custom"]["minecraft:walk_one_cm"] + stats["minecraft:custom"]["minecraft:walk_under_water_one_cm"] + stats["minecraft:custom"]["minecraft:sprint_one_cm"]);},
    total_travelled(stats: IStatsObject)           {return prettiyDistance(stats["minecraft:custom"]["minecraft:sprint_one_cm"] + stats["minecraft:custom"]["minecraft:walk_on_water_one_cm"] + stats["minecraft:custom"]["minecraft:crouch_one_cm"] + stats["minecraft:custom"]["minecraft:climb_one_cm"] + stats["minecraft:custom"]["minecraft:walk_one_cm"] + stats["minecraft:custom"]["minecraft:walk_under_water_one_cm"] + stats["minecraft:custom"]["minecraft:boat_one_cm"] + stats["minecraft:custom"]["minecraft:swim_one_cm"] + stats["minecraft:custom"]["minecraft:fly_one_cm"] + stats["minecraft:custom"]["minecraft:aviate_one_cm"] + stats["minecraft:custom"]["minecraft:fall_one_cm"]);},
    total_per_death_mined(stats: IStatsObject)     {return Math.round(_statsTemplates.single.total_mined(stats)     / _statsTemplates.single.deaths(stats))},
    total_per_death_used(stats: IStatsObject)      {return Math.round(_statsTemplates.single.total_used(stats)      / _statsTemplates.single.deaths(stats))},
    total_per_death_crafted(stats: IStatsObject)   {return Math.round(_statsTemplates.single.total_crafted(stats)   / _statsTemplates.single.deaths(stats))},
    total_per_death_broken(stats: IStatsObject)    {return Math.round(_statsTemplates.single.total_broken(stats)    / _statsTemplates.single.deaths(stats))},
    total_per_death_dropped(stats: IStatsObject)   {return Math.round(_statsTemplates.single.total_dropped(stats)   / _statsTemplates.single.deaths(stats))},
    total_per_death_picked_up(stats: IStatsObject) {return Math.round(_statsTemplates.single.total_picked_up(stats) / _statsTemplates.single.deaths(stats))},
    total_per_death_travelled(stats: IStatsObject) {return Math.round(_statsTemplates.single.total_travelled(stats) / _statsTemplates.single.deaths(stats))},
  }
}

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
    top10Values[i] = {key: entry.key.replace("minecraft:", ""), value: entry.value};
    i++;
  });

  //Return the finished object
  return top10Values;
};

export = minecraft;