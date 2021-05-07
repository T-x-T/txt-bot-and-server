/*
 *  Email component index file
 *  Contains all functions/event listeners to be called from external sources
 */

//Dependencies
import main = require("./email.js");
import type Application = require("../application/application.js");

let config: IConfigEmail;
let environment: EEnvironment;

export = {
  init(_config: IConfigEmail, _environment: EEnvironment) {
    config = _config;
    environment = _environment;
    main.init(config);
  },

  sendNewApplicationMail(application: Application) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_email_sendNewApplicationMail", application);
      return;
    }
    main.application.confirmation(application);
  },

  sendApplicationDeniedMail(application: Application) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_email_sendApplicationDeniedMail", application);
      return;
    }
    main.application.denied(application);
  },

  sendApplicationAcceptedMail(application: Application) {
    if(environment == EEnvironment.testing) {
      global.g.emitter.emit("testing_email_sendApplicationAcceptedMail", application);
      return;
    }
    main.application.accepted(application);
  },

  sendContactUsEmail: main.contact.new
};