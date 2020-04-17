/*
 *  INDEX FILE FOR DISCORD_API COMPONENT
 *  This file contains all functions that are to be called from other components
 */

//Dependencies
const main = require('./main.js');

//Create the container
var index = {};

//Returns a userObject from discords api
//Input is an object with the type as a key
//Allowed types are: id, token
index.getUserObject = function(input, options, callback){
  if(input.hasOwnProperty('id')){
    main.getUserObjectById(input.id, callback);
  }else if (input.hasOwnProperty('token')){
    main.getUserObject(input.token, callback);
  }else{
    callback('No valid input received, input: ' + input, false);
  }
};

//Updates the userobject cache
index.updateCache = function(){
  main.updateUserIdCache();
};

//Export the container
module.exports = index;