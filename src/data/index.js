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
index.get = function(filter, type, options, callback) {
  backend.get(filter, type, options, callback);
};

//Delete one entry
index.delete = function(filter, type, options, callback) {
  backend.delete(filter, type, options, callback);
};

//Export the container
module.exports = index;