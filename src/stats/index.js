/*
 *  INDEX FILE FOR STATS COMPONENT
 *  description
 */

//Dependencies
const config = require('../../config.js');
const main = require('./main.js');

//Create the container
var index = {};

//Execute the update workflow of the mc stats
index.updateMcStats = function(){

};

//Get a statistics template
index.get = function(template, options, callback){
  main.template[template](options, callback);
};

//Export the container
module.exports = index;