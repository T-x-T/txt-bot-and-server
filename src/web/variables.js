/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const stats           = require('../stats');
const os              = require('os');
const blog            = require('../blog');
const widgets         = require('./widgets.js');
const discord_api     = require('../discord_api');
const fs              = require('fs');
const path            = require('path');
const MemberFactory   = require('../user/memberFactory.js');
const memberFactory   = new MemberFactory();
memberFactory.connect();

//Create internal container
var _internal = {};
var data;

//Generates options for all years from the current year-80 and current year - 8
_internal.generateBirthyearOptions = function(callback){
  let output = '';
  let curYear = new Date().getFullYear();
  for(let i = curYear - 12; i > curYear - 80; i--){
      output += `<option value="${i}">${i}</option>\n`;
  }
  callback(output);
};

var _getters = {};

//Callsback the html for all interface widgets that the current user is allowed to see
_getters.interface = function(callback){
  let access_token = data.cookies.access_token;
  widgets.get(access_token, function(html){
    callback({
      'widgets': html,
      'pax_title': 'Member interface'
    });
  });
};

//Calls back an object containing some basic statistics
_getters.statistics = function(callback){
  stats.get('overview', false,  function(err1, obj){
    stats.get('countryList', false, function(err2, map_data){
      callback({
        'pax_title': 'Statistics',
        'total_members': obj.total_members,
        'average_age': obj.average_age,
        'median_age': obj.median_age,
        'total_playtime': obj.total_playtime,
        'map_data': JSON.stringify(map_data)
      });
    });
  });
};

_getters.town_of_paxterya = function(callback){
  fs.readFile(path.join(__dirname, '../../web/web/assets/img/town_of_paxterya_roads.svg'), function(err, data){
    let output = {
      'pax_title': 'Town of Paxterya'
    };
    if(!err && data){
      output.map = data;
    }else{
      output.map = 'Error';
    }
    callback(output);
  })
};

_getters.index = function(callback){
  blog.getNewest()
    .then(blogPost => {
      let body = '';
      body += `<article class="news"><h2>${blogPost.title}</h2><img class="author" src="assets/paxterya/img/avatar-${blogPost.author.toLowerCase()}.png"><span class="subtitle">${new Date(blogPost.date).toISOString().substring(0, 10)}. Author: ${blogPost.author}</span><section>`;
      body += blogPost.body;
      body += `</section></article>`;

      callback({
        'newest_post': body,
        'pax_title': 'Paxterya Minecraft Community'
      });
    })
    .catch(e => {
      callback({
        'newest_post': 'Something went horribly wrong :( Thats why you only get an error message instead of a spicy blog post: ' + e.message,
        'pax_title': 'Paxterya Minecraft Community'
      });
    })
};

//Callsback an object for all widgets on the interface
_getters.widgets = function(callback){
  discord_api.getUserObject({token: data.access_token}, false, function(err, userObject){
    if(userObject){
      memberFactory.getByDiscordId(userObject.id)
      .then(member => {
        callback({
          IGN: member.getMcIgn()
        });
      })
      .catch(e => callback({IGN: 'Error'}));
    }else{
      callback({IGN: 'Error'});
    }
  });
};

const template = {
  'interface.html': _getters.interface,
  'index.html': _getters.index,
  'statistics.html': _getters.statistics,
  'blog.html': {
    'pax_title': 'Blog'
  },
  'town-of-paxterya.html': _getters.town_of_paxterya,
  'contact-us.html': {
    'pax_title': 'Contact us!'
  },
  'join-us.html': {
    'pax_title': 'Join us!',
    'birthyears': _internal.generateBirthyearOptions,
    'oauth': config.auth.oauth_uris.application
  },
  'members.html': {
    'pax_title': 'All Members'
  },
  'privacy-policy.html': {
    'pax_title': 'Privacy Policy'
  },
  'rules.html': {
    'pax_title': 'Rules'
  },
  'hardware.html': {
    'pax_title': 'Server Hardware'
  },
  'our-world.html': {
    'pax_title': 'Our World'
  },
  'penliam.html': {
    'pax_title': 'Penliam'
  },
  'more-towns.html': {
    'pax_title': 'More Towns'
  },
  'faq.html': {
    'pax_title': 'FAQ'
  },
  'downloads.html': {
    'pax_title': 'Downloads'
  },
  'widgets': _getters.widgets,

};

//Export the variables
module.exports = function(local_data, callback) {
  if(os.platform() != 'win32'){
    local_data.path = local_data.path.replace(path.join(__dirname, '../../web/'), '').replace('/html', '');
  }else{
    local_data.path = local_data.path.replace(path.join(__dirname, '../../web/'), '').replace('web\\html\\','').replace('\\', '/');
  }
  data = local_data;
  let templateData = template[data.path];
  if(typeof templateData == 'object'){
    templateData['online_players'] = global.mcPlayerCount;
    templateData['oauth_staff'] = config.auth.oauth_uris.login;
    templateData['mc_version'] = global.cache.minecraftServerVersion
    callback(templateData);
  }else{
    if(typeof templateData == 'function'){
      templateData(function(variables){
        variables['online_players'] = global.mcPlayerCount;
        variables['oauth_staff'] = config.auth.oauth_uris.login;
        variables['mc_version'] = global.cache.minecraftServerVersion
        callback(variables);
      });
    }else{
      callback(false);
    }
  }
};
