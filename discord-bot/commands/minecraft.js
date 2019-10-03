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
    usage: '*Sub-Commands:*\nIGN add OR remove OR show [mention user to view other IGNs]',

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
                              message.reply('success! Your official Minecraft IGN is now _drumroll_ ' + args[2]);
                            }else{
                              console.log(err)
                              message.reply('I could not update your user object for some weird reason.')
                            }
                          });
                        }else{
                          message.reply('I couldnt get your uuid from mojang, this will be added later! Some functionality might not be available in the meantime');
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
                let userID;
                //Use the userID of the first mentioned user, or the userID of the author
                try {
                  userID = message.mentions.users.first().id;
                } catch (e) {
                  userID = message.author.id;
                }
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
                break;
            }


            break;
        }
    }
};
