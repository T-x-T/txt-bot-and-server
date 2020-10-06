/*
 *	COMMAND FILE FOR KARMA
 *	Returns the current karma of score of a user
 */

//Requirements
const MemberFactory = require('../../user/memberFactory.js');
const memberFactory = new MemberFactory();
memberFactory.connect();

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
          memberFactory.getByDiscordId(userID)
          .then(member => {
            //Get the rank of the user
            let rank = entries.indexOf(member.getKarma());
            //Get the total amount of users
            let totalUsers = entries.length;
            message.channel.send(`<@${userID}> has ${member.getKarma()} karma and thus has the rank ${rank + 1} of ${totalUsers} total Users!`);
          })
          .catch(e => message.channel.send('There was an oopsie (Im kinda sorry): ' + e));
        });
        break;
      default:
        //user wants to see karma of a user
        //Check if the userID is weird
        if (!userID) {
          message.channel.send('The specified user is not really a user! (maybe you wanted to use top or rank?)');
        }else{
          //The user is valid
          memberFactory.getByDiscordId(userID)
          .then(member => message.channel.send('<@' + userID + '> has ' + member.getKarma() + ' karma'))
          .catch(e => message.channel.send('There was an oopsie (Im kinda sorry): ' + e));
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
    var output = 'Top Members:\n\n';
    output += '`Rank  Karma  Name`\n';
    entries.forEach((curEntry) => {
      output += '`';
      count++;
      //Add current rank and amount of karma with correct padding
      output += `${count}.`;
      for(let i = 0; i < 11 - `${count}.${curEntry.karma}`.length; i++) output += ' ';
      output += curEntry.karma;

      //Insert the right amount of spaces
      output += '  ';
      output += `${curEntry.name}`;
      output += '`\n';
    });

    //callback the output string
    callback(output);
  });
};

_internals.getSortedKarmaArray = function(includeNames, callback){
  //Get all user objects and put them into array entries
  memberFactory.getAll()
  .then(members => {
    let entries = [];
    members.forEach((member) => {
      let finishedObject = false;
      if(includeNames) {
        finishedObject = {
          name: member.getMcIgn() ? member.getMcIgn() : member.getDiscordUserName(),
          karma: member.getKarma()
        };
      } else {
        finishedObject = member.getKarma();
      }

      entries.push(finishedObject);
    });
    //Sort the array
    if(includeNames) {
      entries = entries.sort(function (obj1, obj2) {
        return obj2.karma - obj1.karma;
      });
    } else {
      entries = entries.sort(function (obj1, obj2) {
        return obj2 - obj1;
      });
    }

    callback(entries);
  })
  .catch(e => {
    console.log(e)
    callback(false);
  });
};
