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
    usage: '[mention user OR top]',

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
                            var finishedObject = {
                                name: document.discord,
                                karma: document.karma
                            };
                            entries.push(finishedObject);
                            console.log(finishedObject.name)
                            console.log(discordHelpers.getNicknameByID(finishedObject.name))
                        });
                    });
                    //Now we can stop
                    return;
                }
            }
        }

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