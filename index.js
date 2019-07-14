/*
 *  INDEX FILE
 *  for starting all components
 */

//Dependencies
const config = require('./config.js');
const webServer = require('./web/webServer.js');

//Create the container
var app = {};

//Init
app.init = function () {
    webServer.init();
};

//Call init
app.init();

//Export the container
module.exports = app;