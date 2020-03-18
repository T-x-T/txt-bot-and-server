/*
 *  INTERFACE FOR THE BULLETIN COMPONENT
 *  Contains all functions that are to be called from external sources
 */

//Dependencies
const config = require('../../config.js');
const main = require('./main.js');

//Create the container
var index = {};

//Save a entry item (calls new or edit)
index.save = function(input, options, callback){
  main.save(input, callback);
};

//Retrieve one or multiple entries 
//Options:
//first: only return the first object of the result
index.get = function(filter, options, callback) {
  main.get(filter, callback);
};

//Delete all entries matching the filter
index.delete = function(filter, options, callback) {
  main.delete(filter, callback);
};

//Export the container
module.exports = index;