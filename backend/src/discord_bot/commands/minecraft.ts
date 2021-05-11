/*
*	COMMAND FILE FOR MINECRAFT
*	Command to handle all minecraft related tasks
*/

import minecraft = require("../../minecraft/index.js");
import stats = require("../../stats");
import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

import Discord = require("discord.js");

export = {
  name: "minecraft",
  description: "This command provides different functionality for minecraft server integration",
  aliases: ["mc", "mcserver"],
  usage: "*Sub-Commands:*\nstats ([rank]) [collection]  [mention user to view other stats]\n+mc stats general\n+mc stats rank total",

  async execute(message: Discord.Message, args: string[]) {
    switch(args[0]){
      case "stats":
        let userID;
        //If the user is all then get stats for all users combined
        if(args[2] == "all"){
          userID = false;
        }else{
          //Use the userID of the first mentioned user, or the userID of the author
          try {
            userID = message.mentions.users.first().id;
          } catch (e) {
            userID = message.author.id;
          }
        }

        if(userID){
          //If we made it here, the user wants to get the stats for one specific person
          const member = await memberFactory.getByDiscordId(userID as string);
          if(args[1] == "rank") {
            let output = "```";
            output += await statsSwitch(args[2], member.getMcUuid(), member.getMcIgn(), true);
            output += "```";
            message.channel.send(output);
          } else {
            let output = "```";
            output += await statsSwitch(args[1], member.getMcUuid(), member.getMcIgn(), false);
            output += "```";
            message.channel.send(output);
          }
        }else{
          //If we made it here, the user wants to get the stats for all players combined
          const ign = "all players";

          const statsOutput = await statsSwitch(args[1], false, ign, false)
          let output = "```";
          output += statsOutput;
          output += "```";
          message.channel.send(output);
        }

        break;
      case "online":
        let output = "```";
        
        let server;
        if(args[1] == "creative" || args[1] == "c"){
          server = "creative_server";
        }else{
          server = "main_smp"
        }

        const res = await minecraft.sendCmd("list", server);
        let onlinePlayerCount = parseInt(res.replace("There are ", ""));
        let onlinePlayers = res.split(": ")[1].split(", ");

        if (onlinePlayerCount === 1) output += `The following player is currently online:\n`;
        else if (onlinePlayerCount === 0) output += `There are no players online right now. It"s on you to change that now!\n`;
        else output += `The following ${onlinePlayerCount} players are currently online:\n`;

        onlinePlayers.forEach(player => output += player + "\n");

        output += "```";
        message.channel.send(output);
        break;
      default:
        message.reply("you tried to do something that I dont understand");
        break;
    }
  }
};

async function statsSwitch(collection: string, uuid: string | boolean, ign: string, rankInfo: boolean){
  let output = "";
  switch(collection){
    case "general": {
      const data = await getStats(collection, uuid, rankInfo);
      if(rankInfo) {
        output += `General statistics for ${ign}:\n`;
        output += `Deaths: ${data.deaths.rank} of ${data._totalPlayers} (${data.deaths.stat})\n`;
        output += `Players killed: ${data.playerKills.rank} of ${data._totalPlayers} (${data.playerKills.stat})\n`;
        output += `Mobs killed: ${data.mobKills.rank} of ${data._totalPlayers} (${data.mobKills.stat})\n`;
        output += `Damage dealt: ${data.damageDealt.rank} of ${data._totalPlayers} (${data.damageDealt.stat})\n`;
        output += `Damage taken: ${data.damageTaken.rank} of ${data._totalPlayers} (${data.damageTaken.stat})\n`;
        output += `Playtime: ${data.playtime.rank} of ${data._totalPlayers} (${data.playtime.stat})\n`;
        output += `Distance by foot: ${data.distanceByFoot.rank} of ${data._totalPlayers} (${data.distanceByFoot.stat})\n`;
        output += `Jumps: ${data.jumps.rank} of ${data._totalPlayers} (${data.jumps.stat})\n`;
        output += `Animals bred: ${data.animals_bred.rank} of ${data._totalPlayers} (${data.animals_bred.stat})\n`;
        output += `Times slept: ${data.times_slept.rank} of ${data._totalPlayers} (${data.times_slept.stat})\n`;
      } else {
        output += `General statistics for ${ign}:\n`;
        output += `Deaths: ${data.deaths}\n`;
        output += `Players killed: ${data.playerKills}\n`;
        output += `Mobs killed: ${data.mobKills}\n`;
        output += `Damage dealt: ${data.damageDealt}\n`;
        output += `Damage taken: ${data.damageTaken}\n`;
        output += `Playtime: ${data.playtime}\n`;
        output += `Distance by foot: ${data.distanceByFoot}\n`;
        output += `Jumps: ${data.jumps}\n`;
        output += `Animals bred: ${data.animals_bred}\n`;
        output += `Times slept: ${data.times_slept}\n`;
      }

      return output;
    }
    case "distance": {
      const data = await getStats("distances", uuid, rankInfo);
      if(rankInfo) {
        output += `Distance statistics for ${ign}:\n`;
        output += `Walk: ${data.distance_walk.rank} of ${data._totalPlayers} (${data.distance_walk.stat})\n`;
        output += `Sprint: ${data.distance_sprint.rank} of ${data._totalPlayers} (${data.distance_sprint.stat})\n`;
        output += `Crouch: ${data.distance_crouch.rank} of ${data._totalPlayers} (${data.distance_crouch.stat})\n`;
        output += `Climb: ${data.distance_climb.rank} of ${data._totalPlayers} (${data.distance_climb.stat})\n`;
        output += `Fall: ${data.distance_fall.rank} of ${data._totalPlayers} (${data.distance_fall.stat})\n`;
        output += `Walk on Water: ${data.distance_walkOnWater.rank} of ${data._totalPlayers} (${data.distance_walkOnWater.stat})\n`;
        output += `Walk under Water: ${data.distance_walkUnderWater.rank} of ${data._totalPlayers} (${data.distance_walkUnderWater.stat})\n`;
        output += `Swim: ${data.distance_swim.rank} of ${data._totalPlayers} (${data.distance_swim.stat})\n`;
        output += `Boat: ${data.distance_boat.rank} of ${data._totalPlayers} (${data.distance_boat.stat})\n`;
        output += `Elytra: ${data.distance_aviate.rank} of ${data._totalPlayers} (${data.distance_aviate.stat})\n`;
        output += `Fly: ${data.distance_fly.rank} of ${data._totalPlayers} (${data.distance_fly.stat})\n`;
      } else {
        output += `Distance statistics for ${ign}:\n`;
        output += `Walk: ${data.distance_walk}\n`;
        output += `Sprint: ${data.distance_sprint}\n`;
        output += `Crouch: ${data.distance_crouch}\n`;
        output += `Climb: ${data.distance_climb}\n`;
        output += `Fall: ${data.distance_fall}\n`;
        output += `Walk on Water: ${data.distance_walkOnWater}\n`;
        output += `Walk under Water: ${data.distance_walkUnderWater}\n`;
        output += `Swim: ${data.distance_swim}\n`;
        output += `Boat: ${data.distance_boat}\n`;
        output += `Elytra: ${data.distance_aviate}\n`;
        output += `Fly: ${data.distance_fly}\n`;
      }

      return output;
    }
    case "ores": {
      const data = await getStats("minedOres", uuid, rankInfo);
      if(rankInfo) {
        output += `Mined ores from ${ign}:\n`;
        output += `Diamond: ${data.mined_diamond_ore.rank} of ${data._totalPlayers} (${data.mined_diamond_ore.stat})\n`;
        output += `Iron: ${data.mined_iron_ore.rank} of ${data._totalPlayers} (${data.mined_iron_ore.stat})\n`;
        output += `Gold: ${data.mined_gold_ore.rank} of ${data._totalPlayers} (${data.mined_gold_ore.stat})\n`;
        output += `Emerald: ${data.mined_emerald_ore.rank} of ${data._totalPlayers} (${data.mined_emerald_ore.stat})\n`;
        output += `Coal: ${data.mined_coal_ore.rank} of ${data._totalPlayers} (${data.mined_coal_ore.stat})\n`;
        output += `Lapis Lazuli: ${data.mined_lapis_ore.rank} of ${data._totalPlayers} (${data.mined_lapis_ore.stat})\n`;
        output += `Redstone: ${data.mined_redstone_ore.rank} of ${data._totalPlayers} (${data.mined_redstone_ore.stat})\n`;
        output += `Quartz: ${data.mined_quartz_ore.rank} of ${data._totalPlayers} (${data.mined_quartz_ore.stat})\n`
        output += `Nether Gold: ${data.mined_nether_gold_ore.rank} of ${data._totalPlayers} (${data.mined_nether_gold_ore.stat})\n`
        output += `Ancient Debris: ${data.mined_ancient_debris.rank} of ${data._totalPlayers} (${data.mined_ancient_debris.stat})\n`
      } else {
        output += `Mined ores from ${ign}:\n`;
        output += `Diamond: ${data.mined_diamond_ore}\n`;
        output += `Iron: ${data.mined_iron_ore}\n`;
        output += `Gold: ${data.mined_gold_ore}\n`;
        output += `Emerald: ${data.mined_emerald_ore}\n`;
        output += `Coal: ${data.mined_coal_ore}\n`;
        output += `Lapis Lazuli: ${data.mined_lapis_ore}\n`;
        output += `Redstone: ${data.mined_redstone_ore}\n`;
        output += `Quartz: ${data.mined_quartz_ore}\n`;
        output += `Nether Gold: ${data.mined_nether_gold_ore}\n`;
        output += `Ancient Debris: ${data.mined_ancient_debris}\n`;
      }

      return output;
    }
    case "total": {
      const data = await getStats(collection, uuid, rankInfo);
      if(rankInfo) {
        output += `Totals from ${ign}:\n`;
        output += `Blocks mined: ${data.total_mined.rank} of ${data._totalPlayers} (${data.total_mined.stat})\n`;
        output += `Blocks built & Items used: ${data.total_used.rank} of ${data._totalPlayers} (${data.total_used.stat})\n`;
        output += `Items crafted: ${data.total_crafted.rank} of ${data._totalPlayers} (${data.total_crafted.stat})\n`;
        output += `Items broken: ${data.total_broken.rank} of ${data._totalPlayers} (${data.total_broken.stat})\n`;
        output += `Items dropped: ${data.total_dropped.rank} of ${data._totalPlayers} (${data.total_dropped.stat})\n`;
        output += `Distance travelled: ${data.total_travelled.rank} of ${data._totalPlayers} (${data.total_travelled.stat})\n`;
      } else {
        output += `Totals from ${ign}:\n`;
        output += `Blocks mined: ${data.total_mined}\n`;
        output += `Blocks built & Items used: ${data.total_used}\n`;
        output += `Items crafted: ${data.total_crafted}\n`;
        output += `Items broken: ${data.total_broken}\n`;
        output += `Items dropped: ${data.total_dropped}\n`;
        output += `Distance travelled: ${data.total_travelled}\n`;
      }
      
      return output;
    }
    case "top_usage": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topUsageItems", uuid, false);
      output += `Top used items from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_picked_up": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topPickedUpItems", uuid, false);
      output += `Top picked up items from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_mined": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topMinedBlocks", uuid, false);
      output += `Top mined items from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_dropped": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topDroppedItems", uuid, false);
      output += `Top dropped items from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_crafted": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topCraftedItems", uuid, false);
      output += `Top crafted items from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_broken": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topBrokenItems", uuid, false);
      output += `Top broken items from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_killed": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topKilledMobs", uuid, false);
      output += `Top killed mobs from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "top_killed_by": {
      if(rankInfo) return "This stats collection doesnt work with ranks :(";
      const data = await getStats("topKilledByMobs", uuid, false);
      output += `Top mobs killed by from ${ign}:\n`;
      let i = 0;
      data.forEach(() => {
        output += `${i + 1}: ${data[i].key}: ${data[i].value}\n`
        i++;
      });
      return output;
    }
    case "total_per_death": {
      const data = await getStats("totalPerDeath", uuid, rankInfo);
      if(rankInfo) {
        output += `Totals per death from ${ign}:\n`;
        output += `Blocks mined: ${data.total_per_death_mined.rank} of ${data._totalPlayers} (${data.total_per_death_mined.stat})\n`;
        output += `Blocks built / Items used: ${data.total_per_death_used.rank} of ${data._totalPlayers} (${data.total_per_death_used.stat})\n`;
        output += `Items crafted: ${data.total_per_death_crafted.rank} of ${data._totalPlayers} (${data.total_per_death_crafted.stat})\n`;
        output += `Items broken: ${data.total_per_death_broken.rank} of ${data._totalPlayers} (${data.total_per_death_broken.stat})\n`;
        output += `Items dropped: ${data.total_per_death_dropped.rank} of ${data._totalPlayers} (${data.total_per_death_dropped.stat})\n`;
        output += `Distance travelled: ${data.total_per_death_travelled.rank} of ${data._totalPlayers} (${data.total_per_death_travelled.stat})\n`;
      } else {
        output += `Totals per death from ${ign}:\n`;
        output += `Blocks mined: ${data.total_per_death_mined}\n`;
        output += `Blocks built / Items used: ${data.total_per_death_used}\n`;
        output += `Items crafted: ${data.total_per_death_crafted}\n`;
        output += `Items broken: ${data.total_per_death_broken}\n`;
        output += `Items dropped: ${data.total_per_death_dropped}\n`;
        output += `Distance travelled: ${data.total_per_death_travelled}\n`;
      }

      return output;
    }
    default:
      return "I couldnt find that collection. Please use one of the following collecitons: general, distance, ores, total, top_usage, top_picked_up, top_dropped, top_crafted, top_broken, top_mined, top_killed, top_killed_by, total_per_death";
  }
};

async function getStats(collection: string, uuid: string | boolean, rankInfo: boolean) {
  let data;
  if(!uuid) {
    data = await stats.mcGetAll(collection);
  } else if(rankInfo) {
    data = await stats.mcGetRanked(uuid as string, collection);
  } else {
    data = await stats.mcGetSingle(uuid as string, collection);
  }

  return data;
}