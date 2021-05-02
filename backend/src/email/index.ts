/*
 *  Email component index file
 *  Contains all functions/event listeners to be called from external sources
 */

//Dependencies
import main = require("./email.js");
import type Application = require("../application/application.js");

export = {
  sendNewApplicationMail(application: Application) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_email_sendNewApplicationMail", application);
      return;
    }
    main.application.confirmation(application);
  },

  sendApplicationDeniedMail(application: Application) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_email_sendApplicationDeniedMail", application);
      return;
    }
    main.application.denied(application);
  },

  sendApplicationAcceptedMail(application: Application) {
    if(global.g.ENVIRONMENT === "testing") {
      global.g.emitter.emit("testing_email_sendApplicationAcceptedMail", application);
      return;
    }
    main.application.accepted(application);
  },

  sendContactUsEmail: main.contact.new
};