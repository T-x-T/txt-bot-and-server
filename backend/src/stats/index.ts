/*
 *  INDEX FILE FOR STATS COMPONENT
 *  description
 */

//Dependencies
const main = require("./main.js");
const updater = require("./update.js");

module.exports = {
  //Execute the update workflow of the mc stats
  updateMcStats() {
    updater();
  },

  //Get a statistics template
  get(template, options, callback) {
    main.template[template](options, callback);
  }
}

export default {}