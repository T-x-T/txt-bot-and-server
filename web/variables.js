/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const config = require('./../config.js');
const log = require('./../lib/log.js');

//Create internal container
var _internal = {};

//Generates options for all years from the current year-80 and current year - 8
_internal.generateBirthyearOptions = function(callback){
  let output = '';
  let curYear = new Date().getFullYear();
  for(let i = curYear - 8; i > curYear - 80; i--){
      output += `<option value="${i}">${i}</option>\n`;
  }
console.log(output);
  callback(output);
};

function getVariables() {
  return {
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
    '/paxterya/interface.html': {
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
    '/paxterya/message-error.html': {
      'pax_title': 'Something went wrong'
    },
    '/paxterya/message-sent.html': {
      'pax_title': 'Success!'
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
};

//Export the variables
module.exports = getVariables;
