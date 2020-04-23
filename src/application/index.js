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
//Options: first: only return first result as an object and not an array; archived: also return applications older than 14 days when querying all applications
//first: if true only returns the first doc
index.get = function(filter, options, callback){
  //If filter indicates that all applications should be returned and option archived isnt set, then return only applications from the last 14 days
  if((Object.keys(filter).length === 0 || !filter) && !options.archived) filter = {timestamp: {$gt: Date.now() - 1000 * 60 * 60 * 24 * 14}};
  
  main.read(filter, options, function(err, docs){
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