/*
*  Index for application Component
*  Contains all functions for external callers
*/

//Dependencies
const main = require('./main.js');

//Create the container
var index = {};

//Saves a new or existing application
index.save = function(input, options, callback){
  if(!input.hasOwnProperty('id')){
    //Its a new application
    main.write(input, callback);
  }else{
    //Its an edit
    main.changeStatus(input.id, input.status, input.reason, callback);
  }
};

//Get applications based on filter
//Options:
//first: if true only returns the first doc
index.get = function(filter, options, callback){
  main.read(filter, function(err, docs){
    if(options.first) docs = docs[0];
    callback(err, docs);
  });
};

//Execute the acceptWorkflow
index.acceptWorkflow = function(discord_id, application){
  main.acceptWorkflow(discord_id, application);
};

//Export the container
module.exports = index;