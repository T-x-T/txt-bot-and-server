/*
 *  Email component index file
 *  Contains all functions/event listeners to be called from external sources
 */

//Dependencies
const config = require('../../config.js');
const main = require('./email.js');

//Create the container
var index = {};

emitter.on('application_new', (application) => {
  main.application.confirmation(application);
});

emitter.on('application_denied', (application) => {
  main.application.denied(application);
});

emitter.on('application_accepted', (application) => {
  main.application.accepted(application);
});

//Export the container
module.exports = index;