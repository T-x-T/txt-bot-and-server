/*
 *  VARIABLES
 *  Contains values for all variables that can be replaced in html filess
 */

//Dependencies
const config          = require('../../config.js');
const application     = require('../application');
const discord_helpers = require('../discord_bot');
const mc_helpers      = require('../minecraft');
const stats           = require('../stats');
const os              = require('os');
const post            = require('../post');
const widgets         = require('./widgets.js');
const discord_api     = require('../discord_api');
const user            = require('../user');
const fs              = require('fs');
const path            = require('path');

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

//Calls back an object for the current application
_getters.application = function(callback){
  application.get({id: data.queryStringObject.id}, {first: true}, function(err, doc){
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
          'age': '~' + (doc.birth_month > new Date(Date.now()).getMonth() + 1 ? parseInt((new Date().getFullYear() - new Date(doc.birth_year, doc.birth_month).getFullYear()).toString()) - 1 : parseInt((new Date().getFullYear() - new Date(doc.birth_year, doc.birth_month).getFullYear()).toString())),
          'birth_year': doc.birth_year,
          'birth_month': doc.birth_month,
          'publish_about_me': doc.publish_about_me,
          'publish_age': doc.publish_age,
          'publish_country': doc.publish_country,
          'discord_avatar': discord_avatar_url,
          'mc_skin': `<img src="${mc_helpers.returnRenderUrl(doc.mc_uuid)}"></img>`,
          'status': statusText
        });
      });
    }else{
      callback(false);
    }
  });
};

//Calls back an object for the current post in the interface
_getters.post = function(callback){
  if(data.queryStringObject.id === 'new'){
    callback({'pax_title': 'Post', 'id': 'new'})
  }else{
    post.get({id: data.queryStringObject.id}, {first: true}, function(err, post){
      callback({
        'pax_title': 'Post',
        'id': post.id,
        'title': post.title,
        'author': post.author,
        'date': new Date(post.date).toISOString().substring(0, 10),
        'body': post.body
      });
    });
  }
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

//Calls back an object for the index.html
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
      return b.date - a.date;
    });

    //Build the final html
    let body = '';
    posts.forEach((post) => {
      body += `<article class="news"><h2>${post.title}</h2><img class="author" src="assets/paxterya/img/avatar-${post.author.toLowerCase()}.png"><span class="subtitle">${new Date(post.date).toISOString().substring(0, 10)}. Author: ${post.author}</span><section>`;
      body += post.body;
      body += `</section></article>`;
    });
    callback({
      'pax_title': 'Start page',
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

//Callsback an object for all widgets on the interface
_getters.widgets = function(callback){
  discord_api.getUserObject({token: data.access_token}, false, function(err, userObject){
    if(userObject){
      user.get({discord: userObject.id}, {privacy: true, onlyPaxterians: true, first: true}, function(err, userData){
        if(!err){
          callback({
            IGN: userData.mcName
          });
        }else{
          callback({IGN: 'Error'});
        }
      });
    }else{
      callback({IGN: 'Error'});
    }
  });
};

const template = {
  'staff/interface.html': _getters.interface,
  'staff/application.html': _getters.application,
  'staff/post.html': _getters.post,
  'statistics.html': _getters.statistics,
  'blog.html': _getters.blog,
  'town-of-paxterya.html': _getters.town_of_paxterya,
  'application-sent.html': {
    'pax_title': 'Success!'
  },
  'index.html': {
    'pax_title': 'Paxterya Minecraft Community'
  },
  'contact-us.html': {
    'pax_title': 'Contact us!'
  },
  'join-us.html': {
    'pax_title': 'Join us!',
    'birthyears': _internal.generateBirthyearOptions,
    'oauth': config['oauth_uris']['application']
  },
  'member.html': {
    'pax_title': 'Member'
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
  'cookieville.html': {
    'pax_title': 'Cookieville'
  },
  'paxterdam.html': {
    'pax_title': 'Paxterdam'
  },
  'paxendorf.html': {
    'pax_title': 'Paxendorf'
  },
  'littleroot-city.html': {
    'pax_title': 'Littleroot City'
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
    templateData['oauth_staff'] = config.oauth_uris.login;
    callback(templateData);
  }else{
    if(typeof templateData == 'function'){
      templateData(function(variables){
        variables['online_players'] = global.mcPlayerCount;
        variables['oauth_staff'] = config.oauth_uris.login;
        callback(variables);
      });
    }else{
      callback(false);
    }
  }
};
