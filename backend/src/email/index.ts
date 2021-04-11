/*
 *  Email component index file
 *  Contains all functions/event listeners to be called from external sources
 */

//Dependencies
const main = require("./email.js");

module.exports = {
  sendNewApplicationMail(application) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_email_sendNewApplicationMail", application);
      return;
    }
    global.g.log(0, 'email', 'index.sendNewApplicationMail called', {application: application});
    main.application.confirmation(application);
  },

  sendApplicationDeniedMail(application) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_email_sendApplicationDeniedMail", application);
      return;
    }
    global.g.log(0, 'email', 'index.sendApplicationDeniedMail called', {application: application});
    main.application.denied(application);
  },

  sendApplicationAcceptedMail(application) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_email_sendApplicationAcceptedMail", application);
      return;
    }
    global.g.log(0, 'email', 'index.sendApplicationAcceptedMail called', {application: application});
    main.application.accepted(application);
  }
};

global.g.emitter.emit('contact_new', (subject, text) => {
  main.contact.new(subject, text);
});

export default {}