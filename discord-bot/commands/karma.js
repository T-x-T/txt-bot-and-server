/*
 *	COMMAND FILE FOR KARMA
 *	Returns the current karma of score of a user
 */

//Requirements
const data = require('./../../lib/data.js');
const discordHelpers = require('./../discord-helpers.js');

module.exports = {
    name: 'karma',
    description: 'Returns the current karma of score of a user\nYour amount of karma changes when someone reacts to one of your messages with the upvote or downvote emoji',
    aliases: ['level', 'xp'],
    usage: 'mention user OR top',

    execute(message, args) {
        var userID;
        if (!args.length) {
            //No arguments, so just get the karma from the author
            userID = message.author.id;
        } else {
            //There are  arguments, check if the argument is a mentioned user
            try {
                userID = message.mentions.users.first().id;
            } catch (e) {
                //Its not a user, so set userID to false, also check if the user wants to get the top list
                userID = false;
                if (args[0] == 'top' || args[0] == 'list') {
                    //User wants to get the top list

                    //Get all user objects
                    data.listAllMembers(function (userObjects) {
                        var entries = [];
                        userObjects.forEach((document) => {
                            var name = 'Wumpus';
                            discordHelpers.getNicknameByID(document.discord, function (data) {
                                if (data) {
                                    name = data;
                                } else {
                                    name = 'Ghost person';
                                }
                            });
                            var finishedObject = {
                                name: name,
                                karma: document.karma
                            };
                            entries.push(finishedObject);
                        });

                        //Sort the array
                        entries = entries.sort(function (obj1, obj2) {
                            return obj2.karma - obj1.karma;
                        });

                        //Only use the top 10 users
                        entries = entries.slice(0, 9);

                        //Form the output string
                        var count = 0;
                        var output = '```Top Members:\n\n';
                        output += 'Rank  Karma\tName\n';
                        entries.forEach((curEntry) => {
                            count++;
                            output += `   ${count}. ${curEntry.karma}`;
                            //Insert the right amount of spaces
                            var spaces = 9 - curEntry.karma.toString().length;
                            for (var i = 0; i < spaces; i++) {
                                output += ' ';
                            }
                            output += `${curEntry.name}\n`;
                        });
                        output += '```';

                        //Send the output string
                        message.channel.send(output);
                    });
                    //Now we can stop
                    return;
                }
            }
        }
        //User wants to get karma of one user

        //Check if the userID is weird and stop everything if it is
        if (!userID) {
            message.channel.send('The specified user is not really a user');
            return;
        }
        data.getKarma(userID, function (err, karma) {
            if (typeof (karma) == 'number') {
                message.channel.send('<@' + userID + '> has ' + karma + ' karma');
            } else {
                message.channel.send('There was an oopsie (Im sorry)');                    //@TODO this will get called once when  the user doesnt exist yet, then the karma gets returned
            }
        });
    }
};
