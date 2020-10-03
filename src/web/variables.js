/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const stats           = require('../stats');
const os              = require('os');
const post            = require('../post');
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
        'total_playtime': obj.total_playtime,
        'map_data': JSON.stringify(map_data)
      });
    });
  });
};

//Calls back an object for the blog.html
_getters.blog = function(callback){
  post.get({public: true}, false, function(err, posts){
    //Check if the post is in the future (here, because we cant really compare the dates directly)
    let filteredPosts = [];
    posts.forEach((post) => {
      if(new Date(post.date).toISOString().substring(0, 10) <= new Date(Date.now()).toISOString().substring(0, 10)) filteredPosts.push(post);
    });
    posts = filteredPosts;

    //Sort the array after the date
    posts.sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    //Build the final html
    let body = '';
    posts.forEach((post) => {
      body += `<article class="news"><h2>${post.title}</h2><img class="author" src="assets/paxterya/img/avatar-${post.author.toLowerCase()}.png"><span class="subtitle">${new Date(post.date).toISOString().substring(0, 10)}. Author: ${post.author}</span><section>`;
      body += post.body;
      body += `</section></article>`;
    });
    callback({
      'pax_title': 'Blog',
      'posts': body
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
  post.get({}, {last: true}, function(err, doc){
    let body = '';
    if(!err && doc){
      body += `<article class="news"><h2>${doc.title}</h2><img class="author" src="assets/paxterya/img/avatar-${doc.author.toLowerCase()}.png"><span class="subtitle">${new Date(doc.date).toISOString().substring(0, 10)}. Author: ${doc.author}</span><section>`;
      body += doc.body;
      body += `</section></article>`;

    }
    callback({
      'newest_post': body,
      'pax_title': 'Paxterya Minecraft Community'
    });
  });
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
  'blog.html': _getters.blog,
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
    callback(templateData);
  }else{
    if(typeof templateData == 'function'){
      templateData(function(variables){
        variables['online_players'] = global.mcPlayerCount;
        variables['oauth_staff'] = config.auth.oauth_uris.login;
        callback(variables);
      });
    }else{
      callback(false);
    }
  }
};
