/*
 *	COMMAND FILE FOR KARMA
 *	Returns the current karma of score of a user
 */

//Requirements
const data = require('./../../lib/data.js');
const discordHelpers = require('./../discord_helpers.js');

module.exports = {
  name: 'karma',
  description: 'Returns the current karma of score of a user\nYour amount of karma changes when someone reacts to one of your messages with the upvote or downvote emoji',
  aliases: ['level', 'xp'],
  usage: 'mention user OR top',

  execute(message, args) {
    var userID;

    //Get the user ID
    try{
      //This will throw if no one is mentioned
      userID = message.mentions.users.first().id;
    }catch(e){
      //If we get here the is no mentioned user, assume the user wants to get stats about themself
      userID = message.author.id;
    }

    //Switch to check which subcommand should be executed
    switch(args[0]){
      case 'top':
        //user wants to see the top list
        _internals.generateTopList(function(output){
          message.channel.send(output);
        });
        break;
      case 'rank':
        //user wants to see rank of a user
        //Get the sorted karma array
        _internals.getSortedKarmaArray(false, function(entries){
          //Get the karma of the current user
          data.getKarma(userID, function(err, karma){
            if(!err){
              //Get the rank of the user
              let rank = entries.indexOf(karma);
              //Get the total amount of users
              let totalUsers = entries.length;
              message.channel.send(`<@${userID}> has ${karma} karma and thus has the rank ${rank + 1} of ${totalUsers} total Users!`);
            }else{
              message.channel.send('There was an oopsie (Im kinda sorry)');
            }
          });
        });
        break;
      default:
        //user wants to see karma of a user
        //Check if the userID is weird
        if (!userID) {
          message.channel.send('The specified user is not really a user! (maybe you wanted to use top or rank?)');
        }else{
          //The user is valid
          data.getKarma(userID, function (err, karma) {
            if (typeof (karma) == 'number' && !err) {
              message.channel.send('<@' + userID + '> has ' + karma + ' karma');
            } else {
              message.channel.send('There was an oopsie (Im kinda sorry)');
            }
          });
        }
        break;
    }
  }
};

var _internals = {};

_internals.generateTopList = function(callback){
  //Get the sorted array
  _internals.getSortedKarmaArray(true, function(entries){
    //Only use the top 10 users
    entries = entries.slice(0, 10);

    //Form the output string
    var count = 0;
    var output = '```Top Members:\n\n';
    output += 'Rank  Karma\tName\n';
    entries.forEach((curEntry) => {
      count++;
      output += count < 10 ? `   ${count}. ${curEntry.karma}` : `  ${count}. ${curEntry.karma}`;
      //Insert the right amount of spaces
      var spaces = 9 - curEntry.karma.toString().length;
      for (var i = 0; i < spaces; i++) {
        output += ' ';
      }
      output += `${curEntry.name}\n`;
    });
    output += '```';

    //callback the output string
    callback(output);
  });
};

_internals.getSortedKarmaArray = function(includeNames, callback){
  //Get all user objects and put them into array entries
  data.listAllMembers(function (userObjects) {
    let entries = [];
    userObjects.forEach((document) => {
      let name = 'Wumpus';
      discordHelpers.getNicknameByID(document.discord, function (data) {
        if (data) {
          name = data;
        } else {
          name = 'Ghost person';
          }
      });
      let finishedObject = false;
      if(includeNames){
        finishedObject = {
          name: name,
          karma: document.karma
        };
      }else{
        finishedObject = document.karma;
      }

        entries.push(finishedObject);
    });
    //Sort the array
    if(includeNames){
      entries = entries.sort(function (obj1, obj2) {
        return obj2.karma - obj1.karma;
      });
    }else{
      entries = entries.sort(function (obj1, obj2) {
        return obj2 - obj1;
      });
    }

    callback(entries);
  });

};
