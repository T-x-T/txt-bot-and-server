/*
 *  Email component index file
 *  Contains all functions/event listeners to be called from external sources
 */

//Dependencies
const main = require('./email.js');

//Create the container
var index = {};

emitter.on('application_new', (application) => {
  global.log(0, 'email', 'event application_new received', {application: application});
  main.application.confirmation(application);
});

emitter.on('application_denied', (application) => {
  global.log(0, 'email', 'event application_denied received', {application: application});
  main.application.denied(application);
});

emitter.on('application_accepted', (application) => {
  global.log(0, 'email', 'event application_accepted received', {application: application});
  main.application.accepted(application);
});

emitter.on('contact_new', (subject, text) => {
  main.contact.new(subject, text);
});

//Export the container
module.exports = index;