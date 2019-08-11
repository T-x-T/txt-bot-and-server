/*
 *  DISCORD HELPER FUNCTIONS
 *  Some helper functions for discord stuff
 */

//Dependencies
const config = require('./../config.js');

//Global var
var client;

//Create the container
var helpers = {};

//Get the nickname of user by their id
helpers.getNicknameByID = function (userID, callback) {
    try {
        callback(client.users.get(userID).username);
    } catch (e) {
        callback(false);
    }
};

//Get the last message from a channel
helpers.getLastMessage = function (channelID, callback) {
    var lastMsg = '';
    var curChannel = client.guilds.get(config.guild).channels.get(channelID);

    curChannel.fetchMessages({ limit: 1 })
        .then(messages => {
            lastMsg = messages.first().content;
            callback(lastMsg);
        })
        .catch(e => {
            console.log(e);
            callback(false);
        });
};

//Sends a given message in a given channel
helpers.sendMessage = function (message, channelID, callback) {
    if (message.length > 0 && channelID.length > 0) {
        //Input seems fine
        var curChannel = client.guilds.get(config.guild).channels.get(channelID);
        curChannel.send(message)
            .then(message => {
                callback(false);
            })
            .catch(e => {
                callback(e);
            });
    } else {
        //Input isnt fine
        callback(true);
    }
};

//Init script
helpers.init = function (origClient) {
    client = origClient;
};

//Export the container
module.exports = helpers;