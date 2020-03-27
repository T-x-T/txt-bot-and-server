/*
 *  Index file for the data component
 *  This file is the adapter between the app and the data-backends
 */

//Dependencies
const config = require('../../config.js');

//Import the right backend accoring to the config
const backend = require(`./${config['data_backend']}`);

//Create the container
var index = {};

//Create a new entry
index.new = function(input, type, options, callback) {
  backend.new(input, type, options, callback);
};

//Edit one existing entry
index.edit = function(input, type, options, callback) {
  backend.edit(input, type, options, callback);
};

//Get multiple entries
//Options:
//first = true: get only first element as an object
//latest = true: get only the newest document as an object
//sub_type = some value: if a sub_type is given only return things that match the sub_type
index.get = function(filter, type, options, callback) {
  if(filter === false) filter = {};

  if(options.hasOwnProperty('sub_type')) filter = {$and: [{sub_type: sub_type}, filter]};
  if(options.latest) options.first = true;
  if(options.hasOwnProperty('latest')) options.sort = {_id: -1};
  
  backend.get(filter, type, options, function(err, docs){
    if(options.first === true){
      let output = docs.length > 0 ? docs[0] : [];
      callback(err, output);
    }else{
      callback(err, docs);
    }
  });
};

//Delete one entry
index.delete = function(filter, type, options, callback) {
  backend.delete(filter, type, options, callback);
};

//Export the container
module.exports = index;