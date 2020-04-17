/*
 *  INDEX FILE FOR STATS COMPONENT
 *  description
 */

//Dependencies
const main = require('./main.js');
const updater = require('./update.js');

//Create the container
var index = {};

//Execute the update workflow of the mc stats
index.updateMcStats = function(){
  updater.update_mc_stats();
};

//Get a statistics template
index.get = function(template, options, callback){
  main.template[template](options, callback);
};

//Export the container
module.exports = index;