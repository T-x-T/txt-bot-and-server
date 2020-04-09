/*
 *  INDEX FILE FOR THE AUTH COMPONENT
 *  This file contains all functions that are to be called from other components
 */

//Dependencies
const config = require('../../config.js');
const main   = require('./main.js');

//Create the container
var index = {};

//Gets the discord_id from an input
//input is an object containing one key for the type of input and the value
//Valid types are: code, token
index.getDiscordId = function(input, options, callback){
  if(input.hasOwnProperty('code')){
    main.getDiscordIdFromCode(input.code, options.redirect, callback);
  }else if (input.hasOwnProperty('token')){
    main.getDiscordIdFromToken(input.token, callback);
  }else{
    callback('No valid input received, input: ' + input, false);
  }
};

//Gets the access_level from an input
//input is an object containing one key for the type of input and the value
//Valid types are: code, token
index.getAccessLevel = function(input, options, callback){
  if(input.hasOwnProperty('code')){
    main.getCodeAccessLevel(input.code, options.redirect, callback);
  }else if (input.hasOwnProperty('token')){
    main.getTokenAccessLevel(input.token, callback);
  }else{
    callback('No valid input received, input: ' + input, false);
  }
};

//Export the container
module.exports = index;