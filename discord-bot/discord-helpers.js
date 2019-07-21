/*
 *  DISCORD HELPER FUNCTIONS
 *  Some helper functions for discord stuff
 */

//Dependencies
const config = require('./../config.js');
const Discord = require('discord.js');
const client = new Discord.Client();

//Create the container
var helpers = {};

//Get the nickname of user by their id
helpers.getNicknameByID = function (userID, callback) {
    //console.log(client.users.first().username)             FIX
};

//Export the container
module.exports = helpers;