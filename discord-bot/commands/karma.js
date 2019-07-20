/*
 *	COMMAND FILE FOR KARMA
 *	Returns the current karma of score of a user
 */
const data = require('./../../lib/data.js');
module.exports = {
    name: 'karma',
    description: 'Returns the current karma of score of a user\nYour amount of karma changes when someone reacts to one of your messages with the upvote or downvote emoji',
    aliases: ['level', 'xp'],
    usage: '[command name]',

    execute(message, args) {
        var userID;
        if (!args.length) {
            //No user specified, so just use the author
            userID = message.author.id;
        } else {
            //User is specified
            try {
                userID = message.mentions.users.first().id;
            } catch (e) {
                userID = false;
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