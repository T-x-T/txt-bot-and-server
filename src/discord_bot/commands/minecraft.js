/*
*	COMMAND FILE FOR MINECRAFT
*	Command to handle all minecraft related tasks
*/

const user = require('../../user');
const stats = require('../../stats');

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
        }else{
          output += `General statistics for ${ign}:\n`;
          output += `Deaths: ${stats.deaths}\n`;
          output += `Players killed: ${stats.playerKills}\n`;
          output += `Mobs killed: ${stats.mobKills}\n`;
          output += `Damage dealt: ${stats.damageDealt}\n`;
          output += `Damage taken: ${stats.damageTaken}\n`;
          output += `Playtime: ${stats.playtime}\n`;
          output += `Distance by foot: ${stats.distanceByFoot}\n`;
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
          output += `Walk: ${stats.walk.rank} of ${stats._totalPlayers} (${stats.walk.stat})\n`;
          output += `Sprint: ${stats.sprint.rank} of ${stats._totalPlayers} (${stats.sprint.stat})\n`;
          output += `Crouch: ${stats.crouch.rank} of ${stats._totalPlayers} (${stats.crouch.stat})\n`;
          output += `Climb: ${stats.climb.rank} of ${stats._totalPlayers} (${stats.climb.stat})\n`;
          output += `Fall: ${stats.fall.rank} of ${stats._totalPlayers} (${stats.fall.stat})\n`;
          output += `Walk on Water: ${stats.walkOnWater.rank} of ${stats._totalPlayers} (${stats.walkOnWater.stat})\n`;
          output += `Walk under Water: ${stats.walkUnderWater.rank} of ${stats._totalPlayers} (${stats.walkUnderWater.stat})\n`;
          output += `Swim: ${stats.swim.rank} of ${stats._totalPlayers} (${stats.swim.stat})\n`;
          output += `Boat: ${stats.boat.rank} of ${stats._totalPlayers} (${stats.boat.stat})\n`;
          output += `Elytra: ${stats.aviate.rank} of ${stats._totalPlayers} (${stats.aviate.stat})\n`;
          output += `Fly: ${stats.fly.rank} of ${stats._totalPlayers} (${stats.fly.stat})\n`;
        }else{
          output += `Distance statistics for ${ign}:\n`;
          output += `Walk: ${stats.walk}\n`;
          output += `Sprint: ${stats.sprint}\n`;
          output += `Crouch: ${stats.crouch}\n`;
          output += `Climb: ${stats.climb}\n`;
          output += `Fall: ${stats.fall}\n`;
          output += `Walk on Water: ${stats.walkOnWater}\n`;
          output += `Walk under Water: ${stats.walkUnderWater}\n`;
          output += `Swim: ${stats.swim}\n`;
          output += `Boat: ${stats.boat}\n`;
          output += `Elytra: ${stats.aviate}\n`;
          output += `Fly: ${stats.fly}\n`;
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
          output += `Diamond: ${stats.diamond.rank} of ${stats._totalPlayers} (${stats.diamond.stat})\n`;
          output += `Iron: ${stats.iron.rank} of ${stats._totalPlayers} (${stats.iron.stat})\n`;
          output += `Gold: ${stats.gold.rank} of ${stats._totalPlayers} (${stats.gold.stat})\n`;
          output += `Emerald: ${stats.emerald.rank} of ${stats._totalPlayers} (${stats.emerald.stat})\n`;
          output += `Coal: ${stats.coal.rank} of ${stats._totalPlayers} (${stats.coal.stat})\n`;
          output += `Lapis Lazuli: ${stats.lapis.rank} of ${stats._totalPlayers} (${stats.lapis.stat})\n`;
          output += `Redstone: ${stats.redstone.rank} of ${stats._totalPlayers} (${stats.redstone.stat})\n`;
        }else{
          output += `Mined ores from ${ign}:\n`;
          output += `Diamond: ${stats.diamond}\n`;
          output += `Iron: ${stats.iron}\n`;
          output += `Gold: ${stats.gold}\n`;
          output += `Emerald: ${stats.emerald}\n`;
          output += `Coal: ${stats.coal}\n`;
          output += `Lapis Lazuli: ${stats.lapis}\n`;
          output += `Redstone: ${stats.redstone}\n`;
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
          output += `Blocks mined: ${stats.mined.rank} of ${stats._totalPlayers} (${stats.mined.stat})\n`;
          output += `Blocks built & Items used: ${stats.used.rank} of ${stats._totalPlayers} (${stats.used.stat})\n`;
          output += `Items crafted: ${stats.crafted.rank} of ${stats._totalPlayers} (${stats.crafted.stat})\n`;
          output += `Items broken: ${stats.broken.rank} of ${stats._totalPlayers} (${stats.broken.stat})\n`;
          output += `Items dropped: ${stats.dropped.rank} of ${stats._totalPlayers} (${stats.dropped.stat})\n`;
          output += `Distance travelled: ${stats.travelled.rank} of ${stats._totalPlayers} (${stats.travelled.stat})\n`;
        }else{
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${stats.mined}\n`;
          output += `Blocks built & Items used: ${stats.used}\n`;
          output += `Items crafted: ${stats.crafted}\n`;
          output += `Items broken: ${stats.broken}\n`;
          output += `Items dropped: ${stats.dropped}\n`;
          output += `Distance travelled: ${stats.travelled}\n`;
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
          output += `Blocks mined: ${stats.mined.rank} of ${stats._totalPlayers} (${stats.mined.stat})\n`;
          output += `Blocks built / Items used: ${stats.used.rank} of ${stats._totalPlayers} (${stats.used.stat})\n`;
          output += `Items crafted: ${stats.crafted.rank} of ${stats._totalPlayers} (${stats.crafted.stat})\n`;
          output += `Items broken: ${stats.broken.rank} of ${stats._totalPlayers} (${stats.broken.stat})\n`;
          output += `Items dropped: ${stats.dropped.rank} of ${stats._totalPlayers} (${stats.dropped.stat})\n`;
          output += `Distance travelled: ${stats.travelled.rank} of ${stats._totalPlayers} (${stats.travelled.stat})\n`;
        }else{
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${stats.mined}\n`;
          output += `Blocks built / Items used: ${stats.used}\n`;
          output += `Items crafted: ${stats.crafted}\n`;
          output += `Items broken: ${stats.broken}\n`;
          output += `Items dropped: ${stats.dropped}\n`;
          output += `Distance travelled: ${stats.travelled}\n`;
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
