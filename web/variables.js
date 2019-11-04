/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const config          = require('./../config.js');
const log             = require('./../lib/log.js');
const application     = require('./../lib/application.js');
const discord_helpers = require('./../discord-bot/discord_helpers.js');
const mc_helpers      = require('./../lib/mc_helpers.js');

//Create internal container
var _internal = {};
var data;
var globalObject;

//Generates options for all years from the current year-80 and current year - 8
_internal.generateBirthyearOptions = function(callback){
  let output = '';
  let curYear = new Date().getFullYear();
  for(let i = curYear - 8; i > curYear - 80; i--){
      output += `<option value="${i}">${i}</option>\n`;
  }
  callback(output);
};

//Gets the application for the current user id and store it in the globalObject;
_internal.getApplication = function(){
  application.readById(data.queryStringObject.id, function(applicationObject){
    if(applicationObject){
      globalObject = applicationObject;
    }else{
      globalObject = false;
    }
  });
};



var _getters = {};

//Calls back an object for the current application
_getters.application = function(callback){
  application.readById(data.queryStringObject.id, function(doc){
    if(doc){
      discord_helpers.getAvatarUrl(doc.discord_id, function(discord_avatar_url){
        if(!discord_avatar_url) discord_avatar_url = 'not found';
          else discord_avatar_url = `<img src="${discord_avatar_url}"></img>`;

        let statusText = 'Invalid status';
        statusText = doc.status == 1 ? 'Pending review' : statusText;
        statusText = doc.status == 2 ? 'Denied'         : statusText;
        statusText = doc.status == 3 ? 'Accepted'       : statusText;
        callback({
          'pax_title': 'Application',
          'id': doc.id,
          'discord_nick': doc.discord_nick,
          'mc_ign': doc.mc_ign,
          'about_me': doc.about_me,
          'motivation': doc.motivation,
          'buildings': doc.build_images,
          'country': doc.country,
          'age': '≈' + (new Date().getFullYear() - new Date(doc.birth_year, doc.birth_month).getFullYear()).toString(),
          'birth_year': doc.birth_year,
          'birth_month': doc.birth_month,
          'publish_about_me': doc.publish_about_me,
          'publish_age': doc.publish_age,
          'publish_country': doc.publish_country,
          'discord_avatar': discord_avatar_url,
          'mc_skin': `<img src="${mc_helpers.getRenderUrl(doc.mc_uuid)}"></img>`,
          'status': statusText
        });
      });
    }else{
      callback(false);
    }
  });
};

const template = {
  '/paxterya/staff/application.html': _getters.application,
  '/paxterya/index.html': {
    'pax_title': 'Start page'
  },
  '/paxterya/adventure-map.html': {
    'pax_title': 'Adventure Map'
  },
  '/paxterya/applicant.html': {
    'pax_title': 'Applicant'
  },
  '/paxterya/application-error.html': {
    'pax_title': 'Something went wrong :('
  },
  '/paxterya/application-sent.html': {
    'pax_title': 'Success!'
  },
  '/paxterya/contact-us.html': {
    'pax_title': 'Contact us!'
  },
  '/paxterya/farming-map.html': {
    'pax_title': 'Farming map'
  },
  '/paxterya/guides.html': {
    'pax_title': 'Guides'
  },
  '/paxterya/how-to-join.html': {
    'pax_title': 'How to join'
  },
  '/paxterya/staff/interface.html': {
    'pax_title': 'Sicco admin Interface'
  },
  '/paxterya/join-us.html': {
    'pax_title': 'Join us!',
    'birthyears': _internal.generateBirthyearOptions
  },
  '/paxterya/member.html': {
    'pax_title': 'Member'
  },
  '/paxterya/members.html': {
    'pax_title': 'All members'
  },
  '/paxterya/message-sent.html': {
    'pax_title': 'Success!'
  },
  '/paxterya/login.html': {
    'pax_title': 'Staff login'
  },
  '/paxterya/our-team.html': {
    'pax_title': 'Our team'
  },
  '/paxterya/our-world.html': {
    'pax_title': 'Our world'
  },
  '/paxterya/privacy-policy.html': {
    'pax_title': 'Privacy Policy'
  },
  '/paxterya/rules.html': {
    'pax_title': 'Rules'
  },
  '/paxterya/statistics.html': {
    'pax_title': 'Statistics'
  },
  '/paxterya/vanilla-map.html': {
    'pax_title': 'Vanilla map'
  },
  'landing_videoID': global.newestVideo.id
};

//Export the variables
module.exports = function(local_data, callback) {
  data = local_data;
  let templateData = template[data.path];
  if(typeof templateData == 'object'){
    callback(templateData);
  }else{
    templateData(function(variables){
      callback(variables);
    })
  }
};
