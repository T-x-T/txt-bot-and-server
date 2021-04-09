/*
 *  Email component index file
 *  Contains all functions/event listeners to be called from external sources
 */

//Dependencies
const main = require('./email.js');

//Create the container
var index = {};

index.sendNewApplicationMail = function(application){
  if(ENVIRONMENT === "testing") {
    emitter.emit("testing_email_sendNewApplicationMail", application); 
    return;
  }
  global.log(0, 'email', 'index.sendNewApplicationMail called', {application: application});
  main.application.confirmation(application);
};

index.sendApplicationDeniedMail = function (application) {
  if(ENVIRONMENT === "testing") {
    emitter.emit("testing_email_sendApplicationDeniedMail", application);
    return;
  }
  global.log(0, 'email', 'index.sendApplicationDeniedMail called', {application: application});
  main.application.denied(application);
};

index.sendApplicationAcceptedMail = function (application) {
  if(ENVIRONMENT === "testing") {
    emitter.emit("testing_email_sendApplicationAcceptedMail", application);
    return;
  }
  global.log(0, 'email', 'index.sendApplicationAcceptedMail called', {application: application});
  main.application.accepted(application);
};

emitter.on('contact_new', (subject, text) => {
  main.contact.new(subject, text);
});

//Export the container
module.exports = index;