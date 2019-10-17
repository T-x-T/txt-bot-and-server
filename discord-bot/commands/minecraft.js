/*
*	COMMAND FILE FOR MINECRAFT
*	Command to handle all minecraft related tasks
*/

const data = require('./../../lib/data.js');
const mc_helpers = require('./../../lib/mc_helpers.js');

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
            //Everything ok, update User
            data.getUserData(message.author.id, function(err, userData){
              if(!err && data){
                userData.mcName = args[2];
                //Also get the uuid for the user
                mc_helpers.getUUID(userData.mcName, function(uuid){
                  if(uuid){
                    data.updateUserData(message.author.id, userData, function(err){
                      if(!err){
                        //Last, but not least trigger the nickname update and tell the user everything worked
                        mc_helpers.addIgnToNick(message.author);
                        message.reply('success! Your official Minecraft IGN is now _drumroll_ ' + args[2]);
                      }else{
                        console.log(err)
                        message.reply('I could not update your user object for some weird reason.')
                      }
                    });
                  }else{
                    message.reply('I couldnt validate your name. Maybe you misspelled it, or mojangs api is down');
                  }
                });

              }else{
                message.reply('I could not get your data to update it :()');
              }
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
                  console.log(err)
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

              let output = '```';
              _internals.statsSwitch(args[1], userID, ign, function(statsOutput){
                output += statsOutput;
                output += '```';
                message.channel.send(output);
              });
            }else{
              message.reply('Couldnt get the IGN for that user');
            }
          });
        }else{
          //If we made it here, the user wants to get the stats for all players combined
          let ign = 'all players';

          let output = '```';
          _internals.statsSwitch(args[1], userID, ign, function(statsOutput){
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

_internals.statsSwitch = function(collection, userID, ign, callback){
  let output = '';
  switch(collection){
    case 'general':
    mc_helpers.getStatTemplate(userID, 'general', function(err, stats){
      if(!err){
        output += `General statistics for ${ign}:\n`;
        output += `Deaths: ${stats.deaths}\n`;
        output += `Players killed: ${stats.playerKills}\n`;
        output += `Mobs killed: ${stats.mobKills}\n`;
        output += `Damage dealt: ${stats.damageDealt}\n`;
        output += `Damage taken: ${stats.damageTaken}\n`;
        output += `Playtime: ${stats.playtime}\n`;
        output += `Distance by foot: ${stats.distanceByFoot}\n`;
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'distance':
    mc_helpers.getStatTemplate(userID, 'distances', function(err, stats){
      if(!err){
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
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'ores':
    mc_helpers.getStatTemplate(userID, 'minedOres', function(err, stats){
      if(!err){
        output += `Mined ores from ${ign}:\n`;
        output += `Diamond: ${stats.diamond}\n`;
        output += `Iron: ${stats.iron}\n`;
        output += `Gold: ${stats.gold}\n`;
        output += `Emerald: ${stats.emerald}\n`;
        output += `Coal: ${stats.coal}\n`;
        output += `Lapis Lazuli: ${stats.lapis}\n`;
        output += `Redstone: ${stats.redstone}\n`;
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'total':
    mc_helpers.getStatTemplate(userID, 'totals', function(err, stats){
      if(!err){
        output += `Totals from ${ign}:\n`;
        output += `Blocks mined: ${stats.mined}\n`;
        output += `Blocks built / Items used: ${stats.used}\n`;
        output += `Items crafted: ${stats.crafted}\n`;
        output += `Items broken: ${stats.broken}\n`;
        output += `Items dropped: ${stats.dropped}\n`;
        output += `Distance traveled: ${stats.traveled}\n`;
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    case 'top_usage':
    mc_helpers.getStatTemplate(userID, 'topUsageItems', function(err, stats){
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
    break;
    case 'top_mined':
    mc_helpers.getStatTemplate(userID, 'topMinedBlocks', function(err, stats){
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
    break;
    case 'top_killed':
    mc_helpers.getStatTemplate(userID, 'topKilledMobs', function(err, stats){
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
    break;
    case 'top_killed_by':
    mc_helpers.getStatTemplate(userID, 'topKilledByMobs', function(err, stats){
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
    break;
    case 'total_per_death':
    mc_helpers.getStatTemplate(userID, 'totalPerDeath', function(err, stats){
      if(!err){
        output += `Totals per death from ${ign}:\n`;
        output += `Blocks mined: ${stats.mined}\n`;
        output += `Blocks built / Items used: ${stats.used}\n`;
        output += `Items crafted: ${stats.crafted}\n`;
        output += `Items broken: ${stats.broken}\n`;
        output += `Items dropped: ${stats.dropped}\n`;
        output += `Distance traveled: ${stats.traveled}\n`;
      }else{
        output += 'Something went wrong and I couldnt get the stats';
      }
      callback(output);
    });
    break;
    default:
    output += 'I couldnt find that collection. Please use one of the following collecitons: general, distance, ores, total, top_usage, top_mined, top_killed, top_killed_by, total_per_death';
    callback(output);
    break;
  }
};
