/*
 *  GENERAL STATS RETRIEVER
 *  This is used to get various predefined statistic templates for mc and member stats
 */

//Dependencies
const config = require('./../config.js');
const data   = require('./data.js');
const mc_helpers = require('./mc_helpers.js');

//Create the container
var stats = {};

//Gets the basic stats for the statistics.html overview
stats.overview = function(callback){
  data.listAllMembers(function(memberData){
    if(memberData){
      mc_helpers.getStatTemplate(false, 'playtime', false, function(err, playtime){
        if(!err && playtime){
          //Get an array with only whitelisted players for paxterya and calculate average age
          let paxterians = [];
          let averageAge = 0;
          memberData.forEach((member) => {
            if(member.status == 1) {
              paxterians.push(member);
              averageAge += parseInt((new Date().getFullYear() - new Date(member.birth_year, member.birth_month).getFullYear()).toString());
            }
          });
          averageAge = averageAge / paxterians.length;
          
          //Constuct and callback the final object
          callback({
            'total_members': paxterians.length,
            'average_age': averageAge,
            'total_playtime': playtime.playtime
          });

        }else{
          callback(false);
        }
      });
    }else{
      callback(false);
    }
  });
};

//Export the container
module.exports = stats;
