/*
 *	COMMAND FILE FOR KARMA
 *	Returns the current karma of score of a user
 */

//Requirements
const user = require('../../user');
const discordHelpers = require('../helpers.js');

module.exports = {
  name: 'karma',
  description: 'Returns the current karma of score of a user\nYour amount of karma changes when someone reacts to one of your messages with the upvote or downvote emoji',
  aliases: ['level', 'xp'],
  usage: 'mention user OR top\n+karma @txt\n+karma top\n+karma rank',

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
        _internals.generateTopList(10, function(output){
          message.channel.send(output);
        });
        break;
      case 'list':
        //user wants to see the top all list
        _internals.generateTopList(false, function(output){
          message.channel.send(output, { split: true });
        });
        break;
      case 'rank':
        //user wants to see rank of a user
        //Get the sorted karma array
        _internals.getSortedKarmaArray(false, function(entries){
          //Get the karma of the current user
          user.get({discord: userID}, {first: true}, function(err, doc){
            if(!err){
              //Get the rank of the user
              let rank = entries.indexOf(doc.karma);
              //Get the total amount of users
              let totalUsers = entries.length;
              message.channel.send(`<@${userID}> has ${doc.karma} karma and thus has the rank ${rank + 1} of ${totalUsers} total Users!`);
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
          user.get({discord: userID}, {first: true}, function (err, doc) {
            if (typeof doc.karma == 'number' && !err) {
              message.channel.send('<@' + userID + '> has ' + doc.karma + ' karma');
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

_internals.generateTopList = function(amount, callback){
  //Get the sorted array
  _internals.getSortedKarmaArray(true, function(entries){
    //Only use the top 10 users
    if(amount) entries = entries.slice(0, amount);

    //Form the output string
    var count = 0;
    var output = '```Top Members:\n\n';
    output += 'Rank  Karma  Name\n';
    entries.forEach((curEntry) => {
      count++;
      //Add current rank and amount of karma with correct padding
      output += `${count}.`;
      for(let i = 0; i < 11 - `${count}.${curEntry.karma}`.length; i++) output += ' ';
      output += curEntry.karma;

      //Insert the right amount of spaces
      output += '  ';
      output += `${curEntry.name}\n`;
    });
    output += '```';

    //callback the output string
    callback(output);
  });
};

_internals.getSortedKarmaArray = function(includeNames, callback){
  //Get all user objects and put them into array entries
  user.get({}, false, function (err, userObjects) {
    let entries = [];
    userObjects.forEach((document) => {
      let name = 'Wumpus';
      discordHelpers.getNicknameByID(document.discord, function (data) {
        if (data) {
          name = data;
        } else {
          return;
        }
      });
      if(name == 'Wumpus') return;
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
