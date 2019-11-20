/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const config = require('./../config.js');
const log = require('./../lib/log.js');

//Create internal container
var internal = {};

function getVariables() {
  return {
    'landing_videoID': global.newestVideo.id
  };
};

//Export the variables
module.exports = getVariables;
