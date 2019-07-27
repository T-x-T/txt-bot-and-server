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

//Init script
helpers.init = function (origClient) {
    client = origClient;
};

//Export the container
module.exports = helpers;