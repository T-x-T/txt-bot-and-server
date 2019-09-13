/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const config = require('./../config.js');
const log = require('./../lib/log.js');

//Create internal container
var internal = {};


//Container with all variables
let variables = {
  //'landing_videoID': internal.get_landing_videoID
  'landing_videoID': global.newestVideo.id
};

//Create and Export the function to get all variables
module.exports = variables;
