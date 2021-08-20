/*
*	COMMAND FILE FOR MINECRAFT
*	Command to handle all minecraft related tasks
*/

import minecraft = require("../../minecraft/index.js");
import stats = require("../../stats");
import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

import { SlashCommandBooleanOption, SlashCommandBuilder, SlashCommandStringOption, SlashCommandSubcommandBuilder, SlashCommandUserOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

const enum StatsTypes {
  normal, rank, compare
}

export = {
  data: new SlashCommandBuilder()
        .setName("mc")
        .setDescription("Commands for interacting with our minecraft servers")
        .addSubcommand(new SlashCommandSubcommandBuilder()
                      .setName("stats")
                      .setDescription("view minecraft stats, from the comfort of your discord client")
                      .addStringOption(new SlashCommandStringOption()
                                        .setName("collection")
                                        .setDescription("The collection of statistics to view")
                                        .setRequired(true)
                                        .addChoices([["general", "general"], ["distance", "distance"], ["ores", "ores"], ["total", "total"], ["top_usage", "top_usage"], ["top_picked_up", "top_picked_up"], ["top_mined", "top_mined"], ["top_dropped", "top_dropped"], ["top_crafted", "top_crafted"], ["top_broken", "top_broken"], ["top_killed", "top_killed"], ["top_killed_by", "top_killed_by"], ["total_per_death", "total_per_death"]])
                      )   
                      .addBooleanOption(new SlashCommandBooleanOption()
                                        .setName("ranked")
                                        .setDescription("shows your rank, incompatible with some collections and with comparsions")
                      )
                      .addBooleanOption(new SlashCommandBooleanOption()
                                        .setName("compare")
                                        .setDescription("compare your stats with someone elses, incompatible with some collections and with ranked")
                      )
                      .addBooleanOption(new SlashCommandBooleanOption()
                                        .setName("all_players")
                                        .setDescription("gets stats for all players combined, incompatible with compare and other_player")
                      )
                      .addUserOption(new SlashCommandUserOption()
                                        .setName("other_player")
                                        .setDescription("look at the stats of someone else, required if using compare")
                      )
        )
        .addSubcommand(new SlashCommandSubcommandBuilder()
                      .setName("online")
                      .setDescription("take a look at who is currently online")
                      .addStringOption(new SlashCommandStringOption()
                                        .setName("server")
                                        .setDescription("The server to check online players on")
                                        .setRequired(true)
                                        .addChoices([["survival", "survival"], ["creative", "creative"]])
                      )
        ),
  async execute(interaction: CommandInteraction) {
    if(!interaction.isCommand()) return;
    switch(interaction.options.getSubcommand()) {
      case "stats": {
        try {
          if(interaction.options.getBoolean("all_players")) {
            await interaction.reply("crunching numbers...");
            return await interaction.editReply(await allMembers(interaction.options.getString("collection")));
            
          } else if(interaction.options.getBoolean("ranked")) {
            await interaction.reply("crunching numbers...");
            const userId = interaction.options.getUser("other_player") ? interaction.options.getUser("other_player").id : interaction.user.id;
            return await interaction.editReply(await singleMemberRanked(interaction.options.getString("collection"), userId));
            
          } else if(interaction.options.getBoolean("compare")) {
            if(!interaction.options.getUser("other_player")) return await interaction.reply("You need to use the other_player argument");
            await interaction.reply("crunching numbers...");
            return await interaction.editReply(await compareMembers(interaction.options.getString("collection"), interaction.user.id, interaction.options.getUser("other_player").id));
            
          } else {
            await interaction.reply("crunching numbers...");
            const userId = interaction.options.getUser("other_player") ? interaction.options.getUser("other_player").id : interaction.user.id;
            return await interaction.editReply(await singleMember(interaction.options.getString("collection"), userId));
          }
        } catch(e) {
          console.log(e)
          if((e as string).includes("no stats received")) {
            return await interaction.reply("Well, someone doesnt have any stats, so this is a bit pointless...");
          } else {
            throw e;
          }
        }
      }
      case "online": {
        await interaction.reply("Hold on, imma call the server rq to ask it :call_me:");

        let output = "```";
        
        const server = interaction.options.getString("server") === "survival" ? "main_smp" : "creative_server";
        const onlinePlayers = await minecraft.getOnlinePlayers(server);
        const afkPlayers = await minecraft.getAfkPlayers(server);
        
        if (onlinePlayers.length === 1) output += `The following player is currently online:\n`;
        else if(onlinePlayers.length === 0) output += `There are no players online right now. It"s on you to change that now!\n`;
        else output += `The following ${onlinePlayers.length} players are currently online:\n`;

        onlinePlayers.forEach(player => afkPlayers.includes(player) ? output += player + " [AFK]\n" : output += player + "\n");

        output += "```";

        return await interaction.editReply(output);
      }
      default: return null;
    }
  }
};

async function allMembers(collection: string) {
  const ign = "all players";

  const statsOutput = await statsSwitch(collection, false, ign, StatsTypes.normal)
  let output = "```";
  output += statsOutput;
  output += "```";

  return output;
}

async function singleMember(collection: string, userId: string) {
  const member = await memberFactory.getByDiscordId(userId);

  let output = "```";
  output += await statsSwitch(collection, member.getMcUuid(), member.getMcIgn(), StatsTypes.normal);
  output += "```";

  return output;
}

async function singleMemberRanked(collection: string, userId: string) {
  const member = await memberFactory.getByDiscordId(userId);

  let output = "```";
  output += await statsSwitch(collection, member.getMcUuid(), member.getMcIgn(), StatsTypes.rank);
  output += "```";

  return output;
}

async function compareMembers(collection: string, userId: string, compareToUserId: string) {
  const member = await memberFactory.getByDiscordId(userId);
  const compareToMember = await memberFactory.getByDiscordId(compareToUserId);

  let output = "```";
  output += await statsSwitch(collection, member.getMcUuid(), member.getMcIgn(), StatsTypes.compare, compareToMember.getMcUuid(), compareToMember.getMcIgn());
  output += "```";

  return output;
}

async function statsSwitch(collection: string, uuid: string | boolean, ign: string, statsType: StatsTypes, compareToUuid?: string, compareToIgn?: string){
  let output = "";
  switch(collection){
    case "general": {
      const data = await getStats(collection, uuid, statsType === StatsTypes.rank);
      switch(statsType) {
        case StatsTypes.normal: {
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
          return output;
        }
        case StatsTypes.rank: {
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
          return output;
        }
        case StatsTypes.compare: {
          const compareData = await getStats(collection, compareToUuid, false);
          output += `Comparing general statistics between ${ign} and ${compareToIgn}\n`;
          output += `Deaths: ${compareData.deaths > data.deaths ? "-" : "+"}${Math.abs(compareData.deaths - data.deaths)} (${data.deaths} vs ${compareData.deaths})\n`;
          output += `Players killed: ${compareData.playerKills > data.playerKills ? "-" : "+"}${Math.abs(compareData.playerKills - data.playerKills)} (${data.playerKills} vs ${compareData.playerKills})\n`;
          output += `Mobs killed: ${compareData.mobKills > data.mobKills ? "-" : "+"}${Math.abs(compareData.mobKills - data.mobKills)} (${data.mobKills} vs ${compareData.mobKills})\n`;
          output += `Damage dealt: ${compareData.damageDealt > data.damageDealt ? "-" : "+"}${Math.abs(compareData.damageDealt - data.damageDealt)} (${data.damageDealt} vs ${compareData.damageDealt})\n`;
          output += `Damage taken: ${compareData.damageTaken > data.damageTaken ? "-" : "+"}${Math.abs(compareData.damageTaken - data.damageTaken)} (${data.damageTaken} vs ${compareData.damageTaken})\n`;
          output += `Playtime: ${Number.parseInt(compareData.playtime) > Number.parseInt(data.playtime) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.playtime) - Number.parseInt(data.playtime))}h (${data.playtime} vs ${compareData.playtime})\n`;
          output += `Distance by foot: ${Number.parseInt(compareData.distanceByFoot) > Number.parseInt(data.distanceByFoot) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distanceByFoot) - Number.parseInt(data.distanceByFoot))}km (${data.distanceByFoot} vs ${compareData.distanceByFoot})\n`;
          output += `Jumps: ${compareData.jumps > data.jumps ? "-" : "+"}${Math.abs(compareData.jumps - data.jumps)} (${data.jumps} vs ${compareData.jumps})\n`;
          output += `Animals bred: ${compareData.animals_bred > data.animals_bred ? "-" : "+"}${(Math.abs(compareData.animals_bred - data.animals_bred))} (${data.animals_bred} vs ${compareData.animals_bred})\n`;
          output += `Times slept: ${compareData.times_slept > data.times_slept ? "-" : "+"}${Math.abs((compareData.times_slept - data.times_slept))} (${data.times_slept} vs ${compareData.times_slept})\n`;
          output = output.replace(/\+0/g, "0");
          return output;
        }
      }
    }
    case "distance": {
      const data = await getStats("distances", uuid, statsType === StatsTypes.rank);
      switch(statsType) {
        case StatsTypes.normal: {
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
          return output;
        }
        case StatsTypes.rank: {
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
          return output;
        }
        case StatsTypes.compare: {
          const compareData = await getStats("distances", compareToUuid, false);
          output += `Comparing distances between ${ign} and ${compareToIgn}\n`;
          output += `Walk: ${Number.parseInt(compareData.distance_walk) > Number.parseInt(data.distance_walk) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_walk) - Number.parseInt(data.distance_walk))}km (${data.distance_walk} vs ${compareData.distance_walk})\n`;
          output += `Sprint: ${Number.parseInt(compareData.distance_sprint) > Number.parseInt(data.distance_sprint) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_sprint) - Number.parseInt(data.distance_sprint))}km (${data.distance_sprint} vs ${compareData.distance_sprint})\n`;
          output += `Crouch: ${Number.parseInt(compareData.distance_crouch) > Number.parseInt(data.distance_crouch) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_crouch) - Number.parseInt(data.distance_crouch))}km (${data.distance_crouch} vs ${compareData.distance_crouch})\n`;
          output += `Climb: ${Number.parseInt(compareData.distance_climb) > Number.parseInt(data.distance_climb) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_climb) - Number.parseInt(data.distance_climb))}km (${data.distance_climb} vs ${compareData.distance_climb})\n`;
          output += `Fall: ${Number.parseInt(compareData.distance_fall) > Number.parseInt(data.distance_fall) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_fall) - Number.parseInt(data.distance_fall))}km (${data.distance_fall} vs ${compareData.distance_fall})\n`;
          output += `Walk on Water: ${Number.parseInt(compareData.distance_walkOnWater) > Number.parseInt(data.distance_walkOnWater) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_walkOnWater) - Number.parseInt(data.distance_walkOnWater))}km (${data.distance_walkOnWater} vs ${compareData.distance_walkOnWater})\n`;
          output += `Walk under Water: ${Number.parseInt(compareData.distance_walkUnderWater) > Number.parseInt(data.distance_walkUnderWater) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_walkUnderWater) - Number.parseInt(data.distance_walkUnderWater))}km (${data.distance_walkUnderWater} vs ${compareData.distance_walkUnderWater})\n`;
          output += `Swim: ${Number.parseInt(compareData.distance_swim) > Number.parseInt(data.distance_swim) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_swim) - Number.parseInt(data.distance_swim))}km (${data.distance_swim} vs ${compareData.distance_swim})\n`;
          output += `Boat: ${Number.parseInt(compareData.distance_boat) > Number.parseInt(data.distance_boat) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_boat) - Number.parseInt(data.distance_boat))}km (${data.distance_boat} vs ${compareData.distance_boat})\n`;
          output += `Elytra: ${Number.parseInt(compareData.distance_aviate) > Number.parseInt(data.distance_aviate) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_aviate) - Number.parseInt(data.distance_aviate))}km (${data.distance_aviate} vs ${compareData.distance_aviate})\n`;
          output += `Fly: ${Number.parseInt(compareData.distance_fly) > Number.parseInt(data.distance_fly) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.distance_fly) - Number.parseInt(data.distance_fly))}km (${data.distance_fly} vs ${compareData.distance_fly})\n`;
          output = output.replace(/\+0/g, "0");
          return output;
        }
      }
    }
    case "ores": {
      const data = await getStats("minedOres", uuid, statsType === StatsTypes.rank);
      switch(statsType) {
        case StatsTypes.normal: {
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
          return output;
        }
        case StatsTypes.rank: {
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
          return output;
        }
        case StatsTypes.compare: {
          const compareData = await getStats("minedOres", compareToUuid, false);
          output += `Comparing mined Ores between ${ign} and ${compareToIgn}\n`;
          output += `Diamond: ${compareData.mined_diamond_ore > data.mined_diamond_ore ? "-" : "+"}${Math.abs(compareData.mined_diamond_ore - data.mined_diamond_ore)} (${data.mined_diamond_ore} vs ${compareData.mined_diamond_ore})\n`;
          output += `Iron: ${compareData.mined_iron_ore > data.mined_iron_ore ? "-" : "+"}${Math.abs(compareData.mined_iron_ore - data.mined_iron_ore)} (${data.mined_iron_ore} vs ${compareData.mined_iron_ore})\n`;
          output += `Gold: ${compareData.mined_gold_ore > data.mined_gold_ore ? "-" : "+"}${Math.abs(compareData.mined_gold_ore - data.mined_gold_ore)} (${data.mined_gold_ore} vs ${compareData.mined_gold_ore})\n`;
          output += `Emerald: ${compareData.mined_emerald_ore > data.mined_emerald_ore ? "-" : "+"}${Math.abs(compareData.mined_emerald_ore - data.mined_emerald_ore)} (${data.mined_emerald_ore} vs ${compareData.mined_emerald_ore})\n`;
          output += `Coal: ${compareData.mined_coal_ore > data.mined_coal_ore ? "-" : "+"}${Math.abs(compareData.mined_coal_ore - data.mined_coal_ore)} (${data.mined_coal_ore} vs ${compareData.mined_coal_ore})\n`;
          output += `Lapis Lazuli: ${compareData.mined_lapis_ore > data.mined_lapis_ore ? "-" : "+"}${Math.abs(compareData.mined_lapis_ore - data.mined_lapis_ore)} (${data.mined_lapis_ore} vs ${compareData.mined_lapis_ore})\n`;
          output += `Redstone: ${compareData.mined_redstone_ore > data.mined_redstone_ore ? "-" : "+"}${Math.abs(compareData.mined_redstone_ore - data.mined_redstone_ore)} (${data.mined_redstone_ore} vs ${compareData.mined_redstone_ore})\n`;
          output += `Quartz: ${compareData.mined_quartz_ore > data.mined_quartz_ore ? "-" : "+"}${Math.abs(compareData.mined_quartz_ore - data.mined_quartz_ore)} (${data.mined_quartz_ore} vs ${compareData.mined_quartz_ore})\n`;
          output += `Nether Gold: ${compareData.mined_nether_gold_ore > data.mined_nether_gold_ore ? "-" : "+"}${Math.abs(compareData.mined_nether_gold_ore - data.mined_nether_gold_ore)} (${data.mined_nether_gold_ore} vs ${compareData.mined_nether_gold_ore})\n`;
          output += `Ancient Debris: ${compareData.mined_ancient_debris > data.mined_ancient_debris ? "-" : "+"}${Math.abs(compareData.mined_ancient_debris - data.mined_ancient_debris)} (${data.mined_ancient_debris} vs ${compareData.mined_ancient_debris})\n`;
          output = output.replace(/\+0/g, "0");
          return output;
        }
      }
    }
    case "total": {
      const data = await getStats(collection, uuid, statsType === StatsTypes.rank);
      switch(statsType) {
        case StatsTypes.normal: {
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${data.total_mined}\n`;
          output += `Blocks built & Items used: ${data.total_used}\n`;
          output += `Items crafted: ${data.total_crafted}\n`;
          output += `Items broken: ${data.total_broken}\n`;
          output += `Items dropped: ${data.total_dropped}\n`;
          output += `Distance travelled: ${data.total_travelled}\n`;
          return output;
        }
        case StatsTypes.rank: {
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${data.total_mined.rank} of ${data._totalPlayers} (${data.total_mined.stat})\n`;
          output += `Blocks built & Items used: ${data.total_used.rank} of ${data._totalPlayers} (${data.total_used.stat})\n`;
          output += `Items crafted: ${data.total_crafted.rank} of ${data._totalPlayers} (${data.total_crafted.stat})\n`;
          output += `Items broken: ${data.total_broken.rank} of ${data._totalPlayers} (${data.total_broken.stat})\n`;
          output += `Items dropped: ${data.total_dropped.rank} of ${data._totalPlayers} (${data.total_dropped.stat})\n`;
          output += `Distance travelled: ${data.total_travelled.rank} of ${data._totalPlayers} (${data.total_travelled.stat})\n`;
          return output;
        }
        case StatsTypes.compare: {
          const compareData = await getStats(collection, compareToUuid, false);
          output += `Comparing totals between ${ign} and ${compareToIgn}\n`;
          output += `Blocks mined: ${compareData.total_mined > data.total_mined ? "-" : "+"}${Math.abs(compareData.total_mined - data.total_mined)} (${data.total_mined} vs ${compareData.total_mined})\n`;
          output += `Blocks built & Items used: ${compareData.total_used > data.total_used ? "-" : "+"}${Math.abs(compareData.total_used - data.total_used)} (${data.total_used} vs ${compareData.total_used})\n`;
          output += `Items crafted: ${compareData.total_crafted > data.total_crafted ? "-" : "+"}${Math.abs(compareData.total_crafted - data.total_crafted)} (${data.total_crafted} vs ${compareData.total_crafted})\n`;
          output += `Items broken: ${compareData.total_broken > data.total_broken ? "-" : "+"}${Math.abs(compareData.total_broken - data.total_broken)} (${data.total_broken} vs ${compareData.total_broken})\n`;
          output += `Items dropped: ${compareData.total_dropped > data.total_dropped ? "-" : "+"}${Math.abs(compareData.total_dropped - data.total_dropped)} (${data.total_dropped} vs ${compareData.total_dropped})\n`;
          output += `Distance travelled: ${Number.parseInt(compareData.total_travelled) > Number.parseInt(data.total_travelled) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.total_travelled) - Number.parseInt(data.total_travelled))}km (${data.total_travelled} vs ${compareData.total_travelled})\n`;
          output = output.replace(/\+0/g, "0");
          return output;
        }
      }
    }
    case "top_usage": {
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      if(statsType !== StatsTypes.normal) return "This stats collection doesnt work with ranks or comparsions (yet) :(";
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
      const data = await getStats("totalPerDeath", uuid, statsType === StatsTypes.rank);
      switch(statsType) {
        case StatsTypes.normal: {
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${data.total_per_death_mined}\n`;
          output += `Blocks built & Items used: ${data.total_per_death_used}\n`;
          output += `Items crafted: ${data.total_per_death_crafted}\n`;
          output += `Items broken: ${data.total_per_death_broken}\n`;
          output += `Items dropped: ${data.total_per_death_dropped}\n`;
          output += `Distance travelled: ${data.total_per_death_travelled}\n`;
          return output;
        }
        case StatsTypes.rank: {
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${data.total_per_death_mined.rank} of ${data._totalPlayers} (${data.total_per_death_mined.stat})\n`;
          output += `Blocks built & Items used: ${data.total_per_death_used.rank} of ${data._totalPlayers} (${data.total_per_death_used.stat})\n`;
          output += `Items crafted: ${data.total_per_death_crafted.rank} of ${data._totalPlayers} (${data.total_per_death_crafted.stat})\n`;
          output += `Items broken: ${data.total_per_death_broken.rank} of ${data._totalPlayers} (${data.total_per_death_broken.stat})\n`;
          output += `Items dropped: ${data.total_per_death_dropped.rank} of ${data._totalPlayers} (${data.total_per_death_dropped.stat})\n`;
          output += `Distance travelled: ${data.total_per_death_travelled.rank} of ${data._totalPlayers} (${data.total_per_death_travelled.stat})\n`;
          return output;
        }
        case StatsTypes.compare: {
          const compareData = await getStats("totalPerDeath", compareToUuid, false);
          output += `Comparing totals per death between ${ign} and ${compareToIgn}\n`;
          output += `Blocks mined: ${compareData.total_per_death_mined > data.total_per_death_mined ? "-" : "+"}${Math.abs(compareData.total_per_death_mined - data.total_per_death_mined)} (${data.total_per_death_mined} vs ${compareData.total_per_death_mined})\n`;
          output += `Blocks built & Items used: ${compareData.total_per_death_used > data.total_per_death_used ? "-" : "+"}${Math.abs(compareData.total_per_death_used - data.total_per_death_used)} (${data.total_per_death_used} vs ${compareData.total_per_death_used})\n`;
          output += `Items crafted: ${compareData.total_per_death_crafted > data.total_per_death_crafted ? "-" : "+"}${Math.abs(compareData.total_per_death_crafted - data.total_per_death_crafted)} (${data.total_per_death_crafted} vs ${compareData.total_per_death_crafted})\n`;
          output += `Items broken: ${compareData.total_per_death_broken > data.total_per_death_broken ? "-" : "+"}${Math.abs(compareData.total_per_death_broken - data.total_per_death_broken)} (${data.total_per_death_broken} vs ${compareData.total_per_death_broken})\n`;
          output += `Items dropped: ${compareData.total_per_death_dropped > data.total_per_death_dropped ? "-" : "+"}${Math.abs(compareData.total_per_death_dropped - data.total_per_death_dropped)} (${data.total_per_death_dropped} vs ${compareData.total_per_death_dropped})\n`;
          output += `Distance travelled: ${Number.parseInt(compareData.total_per_death_travelled) > Number.parseInt(data.total_per_death_travelled) ? "-" : "+"}${Math.abs(Number.parseInt(compareData.total_per_death_travelled) - Number.parseInt(data.total_per_death_travelled))}km (${data.total_per_death_travelled} vs ${compareData.total_per_death_travelled})\n`;
          output = output.replace(/\+0/g, "0");
          return output;
        }
      }
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