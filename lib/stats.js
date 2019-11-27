/*
 *  GENERAL STATS RETRIEVER
 *  This is used to get various predefined statistic templates for mc and member stats
 */

//Dependencies
const config = require('./../config.js');
const data   = require('./data.js');
const mc_helpers = require('./mc_helpers.js');
const oauth = require('./oauth2.js');
const log = require('./log.js');
const discord_helpers = require('./../discord-bot/discord_helpers.js');

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
          averageAge = Math.round(averageAge / paxterians.length);

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

//Gets the basic overview of one or multiple members
//This includes: discord_id, mc_uuid, discord_nick, mc_nick, age, country, playtime, mc_render_url, discord_avatar_url
stats.memberOverview = function (discord_id, filter, callback){
  if(discord_id){
    //Get stats only for one member
    data.getMembers({discord: discord_id}, true, true, function(member){
      if (member){
        member = member[0];

        _internal.addNicks(member, function (member){
          if (member) {
            let mc_render_url = mc_helpers.getRenderUrl(member.mcUUID);
            discord_helpers.getAvatarUrl(discord_id, function (discord_avatar_url){
              if(typeof discord_avatar_url != 'string') discord_avatar_url = false;

              mc_helpers.getStatTemplate(member.mcUUID, 'playtime', false, function (err, playtime) {
                if(err || !playtime) playtime = 0;

                //Build the object to send back
                let obj = {
                  discord_id: member.discord,
                  mc_uuid: member.mcUUID,
                  discord_nick: member.discord_nick,
                  mc_nick: member.mc_ign,
                  age: member.birth_month >= 1 ? parseInt((new Date().getFullYear() - new Date(member.birth_year, member.birth_month).getFullYear()).toString()) : false,
                  country: member.country,
                  playtime: playtime.playtime,
                  mc_render_url: mc_render_url,
                  discord_avatar_url: discord_avatar_url,
                  joined_date: new Date(member._id.getTimestamp()).valueOf()
                };

                callback(obj);
              });
            });
          } else {
            log.write(2, 'stats.memberOverview coulnt add the nicks to an object', { id: discord_id });
            callback(false);
          }
        });
      }else{
        log.write(2, 'stats.memberOverview coulnt get the member object', { id: discord_id });
        callback(false);
      }
    });
  }else{
    //Get stats for all players
    data.getMembers(filter, true, true, function(docs) {
      if (docs) {
        let error = false;
        let output = [];
        for(let i = 0; i < docs.length; i++){
          stats.memberOverview(docs[i].discord, {}, function(doc){
            if (doc) output.push(doc);
              else error = true;

            //Check if this is the last callback
            if(output.length == docs.length){
              if (!error) callback(output);
                else callback(false);
            }
          });
        }
      } else {
        log.write(2, 'stats.memberOverview coulnt get any member objects', {});
        callback(false);
      }
    });
  }
}

//Internal stuff
var _internal = {};

//Adds the current discord nick and mc ign to an application object
_internal.addNicks = function (doc, callback) {
  oauth.getUserObjectById(doc.discord, function (userObject) {
    if (userObject) {
      const mc_helpers = require('./mc_helpers.js');
      mc_helpers.getIGN(doc.mcUUID, function (mc_ign) {
        if (mc_ign) {
          try {
            doc = doc.toObject(); //Convert to a normal object
          } catch (e) { }
          doc.discord_nick = userObject.username + '#' + userObject.discriminator;
          doc.mc_ign = mc_ign;
          callback(doc);
        } else {   
          callback(false);
        }
      });
    } else {
      callback(false);
    }
  });
};

//Export the container
module.exports = stats;
