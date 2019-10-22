/*
*	COMMAND FILE FOR MINECRAFT
*	Command to handle all minecraft related tasks
*/

const data = require('./../../lib/data.js');
const mc_helpers = require('./../../lib/mc_helpers.js');
const discord_helpers = require('./../discord_helpers.js');

module.exports = {
  name: 'minecraft',
  description: 'This command provides different functionality for minecraft server integration',
  aliases: ['mc', 'mcserver'],
  usage: '*Sub-Commands:*\nIGN add OR remove OR show [mention user to view other IGNs]\nstats [mention user to view other stats]',

  execute(message, args) {
    switch(args[0]){
      case 'ign':
      //The user wants to do something with In-Game-Names, figure out what exactly
      switch(args[1]){
        case 'add':
          //Trim input
          args[2] = args[2].trim();
          //Check if provided IGN is somewhat valid
          if(args[2].length >= 3 && args[2].length <= 16){
            //Make sure the user exists
            data.checkMemberExist(message.author.id, true, function(exists) {
              //Everything ok, update User
              data.getUserData(message.author.id, function(err, userData){
                if(!err && data){
                  //Also get the uuid for the user
                  mc_helpers.getUUID(args[2], function(uuid){
                    if(uuid){
                      //Now lets get the correct ign from mojang
                      mc_helpers.getIGN(uuid, function(ign){
                        if(ign){
                          //Now we can update the user
                          userData.mcName = ign;
                          userData.mcUUID = uuid;
                          data.updateUserData(message.author.id, userData, function(err){
                            if(!err){
                              //Last, but not least trigger the nickname update and tell the user everything worked
                              discord_helpers.addIgnToNick(message.member);
                              message.reply('success! Your official Minecraft IGN is now _drumroll_ ' + ign);
                            }else{
                              message.reply('I could not update your user object for some weird reason.')
                            }
                          });
                        }else{
                          message.reply('I couldnt get your correct capitalized name from mojang');
                        }
                      });
                    }else{
                      message.reply('I couldnt validate your name. Maybe you misspelled it, or mojangs api is down');
                    }
                  });
                }else{
                  message.reply('I could not get your data to update it :(');
                }
              });
            });
          }else{
            //Username isnt valid
            message.reply('the provided Username (' + args[2] + ') doesnt seem to be valid');
          }
          break;
        case 'remove':
          //Just set the mcName of the user to null
          data.getUserData(message.author.id, function(err, userData){
            if(!err && data){
              userData.mcName = null;
              data.updateUserData(message.author.id, userData, function(err){
                if(!err){
                  message.reply('success! You no longer have a registered IGN! use +mc add to set it again');
                }else{
                  message.reply('I could not update your user object for some weird reason.')
                }
              });
            }else{
              message.reply('I could not get your data to update it :()');
            }
          });
          break;
        case 'show':
          //User wants to see an IGN
          data.listAllMembers(function(users){
            let userID;
            let showIGN = args[2] != undefined ? true: false;
            let validIGN = false;
            let ign = '';
            //Use the userID of the first mentioned user, or the userID of the author
            try {
              userID = message.mentions.users.first().id;
              showIGN = false;
            } catch (e) {
              userID = message.author.id;
              //User didnt mention anyone, find out if they want to see the discord user for an ign
              if(args[2] != undefined){
                users.forEach((user) => {
                  if(user.mcName != null){
                    if(args[2] == user.mcName.toLowerCase()){
                      validIGN = true;
                      ign = user.mcName;
                      userID = user.discord;
                    }
                  }
                });
              }
            }
            if(showIGN){
              //Mention the discord user that belongs to the given id
              if(validIGN){
                message.reply(`The user ${ign} belongs to <@${userID}>`);
              }else{
                message.reply('I cant find that user');
              }

            }else{
              //Show the ign of the mentioned discord user
              //Get the user object
              data.getUserData(userID, function(err, userData){
                if(!err && userData){
                  //Check if the user has a IGN
                  if(userData.mcName != null){
                    message.reply('The IGN of the specified user is ' + userData.mcName);
                  }else{
                    message.reply('The specified user has no IGN')
                  }
                }else{
                  message.reply('I could not retrieve the IGN of the specified user');
                }
              });
            }
          });
          break;
        default:
          message.reply('You need to specifiy another sub-command like **add**, **show** or **remove**')
          break;
        }
        break;
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
          data.getUserData(userID, function(err, data){
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
    mc_helpers.getStatTemplate(userID, 'general', rankInfo, function(err, stats){
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
    mc_helpers.getStatTemplate(userID, 'distances', rankInfo, function(err, stats){
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
    mc_helpers.getStatTemplate(userID, 'minedOres', rankInfo, function(err, stats){
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
    mc_helpers.getStatTemplate(userID, 'totals', rankInfo, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${stats.mined.rank} of ${stats._totalPlayers} (${stats.mined.stat})\n`;
          output += `Blocks built & Items used: ${stats.used.rank} of ${stats._totalPlayers} (${stats.used.stat})\n`;
          output += `Items crafted: ${stats.crafted.rank} of ${stats._totalPlayers} (${stats.crafted.stat})\n`;
          output += `Items broken: ${stats.broken.rank} of ${stats._totalPlayers} (${stats.broken.stat})\n`;
          output += `Items dropped: ${stats.dropped.rank} of ${stats._totalPlayers} (${stats.dropped.stat})\n`;
          output += `Distance traveled: ${stats.traveled.rank} of ${stats._totalPlayers} (${stats.traveled.stat})\n`;
        }else{
          output += `Totals from ${ign}:\n`;
          output += `Blocks mined: ${stats.mined}\n`;
          output += `Blocks built & Items used: ${stats.used}\n`;
          output += `Items crafted: ${stats.crafted}\n`;
          output += `Items broken: ${stats.broken}\n`;
          output += `Items dropped: ${stats.dropped}\n`;
          output += `Distance traveled: ${stats.traveled}\n`;
        }
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'top_usage':
    if(!rankInfo){
      mc_helpers.getStatTemplate(userID, 'topUsageItems', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topPickedUpItems', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topMinedBlocks', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topDroppedItems', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topCraftedItems', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topBrokenItems', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topKilledMobs', false, function(err, stats){
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
      mc_helpers.getStatTemplate(userID, 'topKilledByMobs', false, function(err, stats){
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
    mc_helpers.getStatTemplate(userID, 'totalPerDeath', rankInfo, function(err, stats){
      if(!err){
        if(rankInfo){
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${stats.mined.rank} of ${stats._totalPlayers} (${stats.mined.stat})\n`;
          output += `Blocks built / Items used: ${stats.used.rank} of ${stats._totalPlayers} (${stats.used.stat})\n`;
          output += `Items crafted: ${stats.crafted.rank} of ${stats._totalPlayers} (${stats.crafted.stat})\n`;
          output += `Items broken: ${stats.broken.rank} of ${stats._totalPlayers} (${stats.broken.stat})\n`;
          output += `Items dropped: ${stats.dropped.rank} of ${stats._totalPlayers} (${stats.dropped.stat})\n`;
          output += `Distance traveled: ${stats.traveled.rank} of ${stats._totalPlayers} (${stats.traveled.stat})\n`;
        }else{
          output += `Totals per death from ${ign}:\n`;
          output += `Blocks mined: ${stats.mined}\n`;
          output += `Blocks built / Items used: ${stats.used}\n`;
          output += `Items crafted: ${stats.crafted}\n`;
          output += `Items broken: ${stats.broken}\n`;
          output += `Items dropped: ${stats.dropped}\n`;
          output += `Distance traveled: ${stats.traveled}\n`;
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
