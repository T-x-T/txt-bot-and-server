/*
 *  INDEX FILE FOR STATS COMPONENT
 *  description
 */

//Dependencies
import main = require("./main.js");
import updater = require("./update.js");


export = {
  //Execute the update workflow of the mc stats
  updateMcStats: updater,
  overview: main.overview,
  memberOverview: main.memberOverview,
  singleMemberOverview: main.singleMemberOverview,
  countryList: main.countryList,
  mcGetRanked: main.mcGetRanked,
  mcGetSingle: main.mcGetSingle,
  mcGetAll: main.mcGetAll
}