/*
*	COMMAND FILE FOR MINECRAFT
*	Command to handle all minecraft related tasks
*/

const user = require('../../user');
const stats = require('../../stats');
const minecraft = require('../../minecraft');

module.exports = {
  name: 'minecraft',
  description: 'This command provides different functionality for minecraft server integration',
  aliases: ['mc', 'mcserver'],
  usage: '*Sub-Commands:*\nstats ([rank]) [collection]  [mention user to view other stats]\n+mc stats general\n+mc stats rank total',

  execute(message, args) {
    switch(args[0]){
      case 'stats':
        //User wants to see some stats
        let userID;
        //If the user is all then get stats for all users combined
        if(args[2] == 'all'){
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
          //Find the IGN out as well
          user.get({discord: userID}, {first: true}, function(err, data){
            if(!err && data.mcName != null){
              let ign = data.mcName;
              let uuid = data.mcUUID;

              if(args[1] == 'rank'){
                //Get the rank flavored stats
                let output = '```';
                _internals.statsSwitch(args[2], uuid, ign, true, function(statsOutput){
                  output += statsOutput;
                  output += '```';
                  message.channel.send(output);
                });
              }else{
                //Normal stats
                let output = '```';
                _internals.statsSwitch(args[1], uuid, ign, false, function(statsOutput){
                  output += statsOutput;
                  output += '```';
                  message.channel.send(output);
                });
              }
            }else{
              message.reply('Couldnt get the IGN for that user');
            }
          });
        }else{
          //If we made it here, the user wants to get the stats for all players combined
          let ign = 'all players';

          let output = '```';
          _internals.statsSwitch(args[1], userID, ign, false, function(statsOutput){
            output += statsOutput;
            output += '```';
            message.channel.send(output);
          });
        }

        break;
      case 'online':
        let output = '```';
        
        let server;
        if(args[1] == 'creative' || args[1] == 'c'){
          server = 'creative_server';
        }else{
          server = 'main_smp'
        }
        minecraft.sendCmd('list', server, function (res) {
          
          let onlinePlayerCount = parseInt(res.replace('There are ', ''));
          let onlinePlayers = res.split(': ')[1].split(', ');

          if (onlinePlayerCount === 1) output += `The following player is currently online:\n`;
          else if (onlinePlayerCount === 0) output += `There are no players online right now. It's on you to change that now!:\n`;
          else output += `The following ${onlinePlayerCount} players are currently online:\n`;

          onlinePlayers.forEach(player => output += player + '\n');

          output += '```';
          message.channel.send(output);
        });
        break;
      default:
        message.reply('you tried to do something that I dont understand');
        break;
    }
  }
};

/*
*
*  From here on are some internal functions to make things neater
*
*/

var _internals = {};

_internals.statsSwitch = function(collection, userID, ign, rankInfo, callback){
  let output = '';
  switch(collection){
    case 'general':
      stats.get('mc', {collection: 'general', rank: rankInfo, uuid: userID}, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `General statistics for ${ign}:\n`;
          output += `Deaths: ${stats.deaths.rank} of ${stats._totalPlayers} (${stats.deaths.stat})\n`;
          output += `Players killed: ${stats.playerKills.rank} of ${stats._totalPlayers} (${stats.playerKills.stat})\n`;
          output += `Mobs killed: ${stats.mobKills.rank} of ${stats._totalPlayers} (${stats.mobKills.stat})\n`;
          output += `Damage dealt: ${stats.damageDealt.rank} of ${stats._totalPlayers} (${stats.damageDealt.stat})\n`;
          output += `Damage taken: ${stats.damageTaken.rank} of ${stats._totalPlayers} (${stats.damageTaken.stat})\n`;
          output += `Playtime: ${stats.playtime.rank} of ${stats._totalPlayers} (${stats.playtime.stat})\n`;
          output += `Distance by foot: ${stats.distanceByFoot.rank} of ${stats._totalPlayers} (${stats.distanceByFoot.stat})\n`;
          output += `Jumps: ${stats.jumps.rank} of ${stats._totalPlayers} (${stats.jumps.stat})\n`;
          output += `Animals bred: ${stats.animals_bred.rank} of ${stats._totalPlayers} (${stats.animals_bred.stat})\n`;
          output += `Times slept: ${stats.times_slept.rank} of ${stats._totalPlayers} (${stats.times_slept.stat})\n`;
        }else{
          output += `General statistics for ${ign}:\n`;
          output += `Deaths: ${stats.deaths}\n`;
          output += `Players killed: ${stats.playerKills}\n`;
          output += `Mobs killed: ${stats.mobKills}\n`;
          output += `Damage dealt: ${stats.damageDealt}\n`;
          output += `Damage taken: ${stats.damageTaken}\n`;
          output += `Playtime: ${stats.playtime}\n`;
          output += `Distance by foot: ${stats.distanceByFoot}\n`;
          output += `Jumps: ${stats.jumps}\n`;
          output += `Animals bred: ${stats.animals_bred}\n`;
          output += `Times slept: ${stats.times_slept}\n`;
        }
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'distance':
    stats.get('mc', {uuid: userID, collection: 'distances', rank: rankInfo}, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `Distance statistics for ${ign}:\n`;
          output += `Walk: ${stats.distance_walk.rank} of ${stats._totalPlayers} (${stats.distance_walk.stat})\n`;
          output += `Sprint: ${stats.distance_sprint.rank} of ${stats._totalPlayers} (${stats.distance_sprint.stat})\n`;
          output += `Crouch: ${stats.distance_crouch.rank} of ${stats._totalPlayers} (${stats.distance_crouch.stat})\n`;
          output += `Climb: ${stats.distance_climb.rank} of ${stats._totalPlayers} (${stats.distance_climb.stat})\n`;
          output += `Fall: ${stats.distance_fall.rank} of ${stats._totalPlayers} (${stats.distance_fall.stat})\n`;
          output += `Walk on Water: ${stats.distance_walkOnWater.rank} of ${stats._totalPlayers} (${stats.distance_walkOnWater.stat})\n`;
          output += `Walk under Water: ${stats.distance_walkUnderWater.rank} of ${stats._totalPlayers} (${stats.distance_walkUnderWater.stat})\n`;
          output += `Swim: ${stats.distance_swim.rank} of ${stats._totalPlayers} (${stats.distance_swim.stat})\n`;
          output += `Boat: ${stats.distance_boat.rank} of ${stats._totalPlayers} (${stats.distance_boat.stat})\n`;
          output += `Elytra: ${stats.distance_aviate.rank} of ${stats._totalPlayers} (${stats.distance_aviate.stat})\n`;
          output += `Fly: ${stats.distance_fly.rank} of ${stats._totalPlayers} (${stats.distance_fly.stat})\n`;
        }else{
          output += `Distance statistics for ${ign}:\n`;
          output += `Walk: ${stats.distance_walk}\n`;
          output += `Sprint: ${stats.distance_sprint}\n`;
          output += `Crouch: ${stats.distance_crouch}\n`;
          output += `Climb: ${stats.distance_climb}\n`;
          output += `Fall: ${stats.distance_fall}\n`;
          output += `Walk on Water: ${stats.distance_walkOnWater}\n`;
          output += `Walk under Water: ${stats.distance_walkUnderWater}\n`;
          output += `Swim: ${stats.distance_swim}\n`;
          output += `Boat: ${stats.distance_boat}\n`;
          output += `Elytra: ${stats.distance_aviate}\n`;
          output += `Fly: ${stats.distance_fly}\n`;
        }
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'ores':
    stats.get('mc', {uuid: userID, collection: 'minedOres', rank: rankInfo}, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `Mined ores from ${ign}:\n`;
          output += `Diamond: ${stats.mined_diamond_ore.rank} of ${stats._totalPlayers} (${stats.mined_diamond_ore.stat})\n`;
          output += `Iron: ${stats.mined_iron_ore.rank} of ${stats._totalPlayers} (${stats.mined_iron_ore.stat})\n`;
          output += `Gold: ${stats.mined_gold_ore.rank} of ${stats._totalPlayers} (${stats.mined_gold_ore.stat})\n`;
          output += `Emerald: ${stats.mined_emerald_ore.rank} of ${stats._totalPlayers} (${stats.mined_emerald_ore.stat})\n`;
          output += `Coal: ${stats.mined_coal_ore.rank} of ${stats._totalPlayers} (${stats.mined_coal_ore.stat})\n`;
          output += `Lapis Lazuli: ${stats.mined_lapis_ore.rank} of ${stats._totalPlayers} (${stats.mined_lapis_ore.stat})\n`;
          output += `Redstone: ${stats.mined_redstone_ore.rank} of ${stats._totalPlayers} (${stats.mined_redstone_ore.stat})\n`;
        }else{
          output += `Mined ores from ${ign}:\n`;
          output += `Diamond: ${stats.mined_diamond_ore}\n`;
          output += `Iron: ${stats.mined_iron_ore}\n`;
          output += `Gold: ${stats.mined_gold_ore}\n`;
          output += `Emerald: ${stats.mined_emerald_ore}\n`;
          output += `Coal: ${stats.mined_coal_ore}\n`;
          output += `Lapis Lazuli: ${stats.mined_lapis_ore}\n`;
          output += `Redstone: ${stats.mined_redstone_ore}\n`;
        }
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'total':
    stats.get('mc', {uuid: userID, collection: 'total', rank: rankInfo}, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${stats.total_mined.rank} of ${stats._totalPlayers} (${stats.total_mined.stat})\n`;
          output += `Blocks built & Items used: ${stats.total_used.rank} of ${stats._totalPlayers} (${stats.total_used.stat})\n`;
          output += `Items crafted: ${stats.total_crafted.rank} of ${stats._totalPlayers} (${stats.total_crafted.stat})\n`;
          output += `Items broken: ${stats.total_broken.rank} of ${stats._totalPlayers} (${stats.total_broken.stat})\n`;
          output += `Items dropped: ${stats.total_dropped.rank} of ${stats._totalPlayers} (${stats.total_dropped.stat})\n`;
          output += `Distance travelled: ${stats.total_travelled.rank} of ${stats._totalPlayers} (${stats.total_travelled.stat})\n`;
        }else{
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${stats.total_mined}\n`;
          output += `Blocks built & Items used: ${stats.total_used}\n`;
          output += `Items crafted: ${stats.total_crafted}\n`;
          output += `Items broken: ${stats.total_broken}\n`;
          output += `Items dropped: ${stats.total_dropped}\n`;
          output += `Distance travelled: ${stats.total_travelled}\n`;
        }
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'top_usage':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topUsageItems'}, function(err, stats){
        if(!err){
          output += `Top used items from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_picked_up':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topPickedUpItems'}, function(err, stats){
        if(!err){
          output += `Top picked up items from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_mined':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topMinedBlocks'}, function(err, stats){
        if(!err){
          output += `Top mined items from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_dropped':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topDroppedItems'}, function(err, stats){
        if(!err){
          output += `Top dropped items from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_crafted':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topCraftedItems'}, function(err, stats){
        if(!err){
          output += `Top crafted items from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_broken':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topBrokenItems'}, function(err, stats){
        if(!err){
          output += `Top broken items from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_killed':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topKilledMobs'}, function(err, stats){
        if(!err){
          output += `Top killed mobs from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'top_killed_by':
    if(!rankInfo){
      stats.get('mc', {uuid: userID, collection: 'topKilledByMobs'}, function(err, stats){
        if(!err){
          output += `Top mobs killed by from ${ign}:\n`;
          let i = 0;
          stats.forEach((entry) => {
            output += `${i + 1}: ${stats[i].key}: ${stats[i].value}\n`
            i++;
          });
        }else{
          output += 'Something went wrong and I couldnt get the stats';
        }
        callback(output);
      });
    }else{
      callback('This stats collection doesnt work with ranks :(');
    }
    break;
    case 'total_per_death':
    stats.get('mc', {uuid: userID, collection: 'totalPerDeath', rank: rankInfo}, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${stats.total_per_death_mined.rank} of ${stats._totalPlayers} (${stats.total_per_death_mined.stat})\n`;
          output += `Blocks built / Items used: ${stats.total_per_death_used.rank} of ${stats._totalPlayers} (${stats.total_per_death_used.stat})\n`;
          output += `Items crafted: ${stats.total_per_death_crafted.rank} of ${stats._totalPlayers} (${stats.total_per_death_crafted.stat})\n`;
          output += `Items broken: ${stats.total_per_death_broken.rank} of ${stats._totalPlayers} (${stats.total_per_death_broken.stat})\n`;
          output += `Items dropped: ${stats.total_per_death_dropped.rank} of ${stats._totalPlayers} (${stats.total_per_death_dropped.stat})\n`;
          output += `Distance travelled: ${stats.total_per_death_travelled.rank} of ${stats._totalPlayers} (${stats.total_per_death_travelled.stat})\n`;
        }else{
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${stats.total_per_death_mined}\n`;
          output += `Blocks built / Items used: ${stats.total_per_death_used}\n`;
          output += `Items crafted: ${stats.total_per_death_crafted}\n`;
          output += `Items broken: ${stats.total_per_death_broken}\n`;
          output += `Items dropped: ${stats.total_per_death_dropped}\n`;
          output += `Distance travelled: ${stats.total_per_death_travelled}\n`;
        }
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    default:
    output += 'I couldnt find that collection. Please use one of the following collecitons: general, distance, ores, total, top_usage, top_picked_up, top_dropped, top_crafted, top_broken, top_mined, top_killed, top_killed_by, total_per_death';
    callback(output);
    break;
  }
};
