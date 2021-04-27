/*
 *  INDEX FILE FOR STATS COMPONENT
 *  description
 */

//Dependencies
import main = require("./main.js");
import updater = require("./update.js");

enum ETemplates {
  overview = "overview",
  memberOverview = "memberOverview",
  countryList = "countryList",
  mc = "mc"
}
ETemplates.countryList
export = {
  //Execute the update workflow of the mc stats
  updateMcStats() {
    updater();
  },

  //Get a statistics template
  get(template: ETemplates, options: any, callback: Function) { //TODO: fix any
    main.template[template](options, callback);
  },

  ETemplates
}