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
const stats           = require('./../lib/stats.js');
const os              = require('os');
const post            = require('./../lib/post.js');
const widgets         = require('./widgets.js');
const oauth           = require('./../lib/oauth2.js');
const _data           = require('./../lib/data.js');

//Create internal container
var _internal = {};
var data;
var globalObject;

//Generates options for all years from the current year-80 and current year - 8
_internal.generateBirthyearOptions = function(callback){
  let output = '';
  let curYear = new Date().getFullYear();
  for(let i = curYear - 12; i > curYear - 80; i--){
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
          'age': '~' + (doc.birth_month > new Date(Date.now()).getMonth() + 1 ? parseInt((new Date().getFullYear() - new Date(doc.birth_year, doc.birth_month).getFullYear()).toString()) - 1 : parseInt((new Date().getFullYear() - new Date(doc.birth_year, doc.birth_month).getFullYear()).toString())),
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

//Calls back an object for the current post in the interface
_getters.post = function(callback){
  if(data.queryStringObject.id === 'new'){
    callback({'pax_title': 'Post', 'id': 'new'})
  }else{
    post.get({id: data.queryStringObject.id}, function(post){
      post = post[0];
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
  stats.overview(function(obj){
    stats.countryList(function(map_data){
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
_getters.index = function(callback){
  post.get({public: true}, function(posts){
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
    body = '';
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

//Callsback an object for all widgets on the interface
_getters.widgets = function(callback){
  oauth.getUserObject(data.access_token, function(userObject){
    if(userObject){
      _data.getMembers({discord: userObject.id}, true, true, function(userData){
        if(userData.length > 0){
          callback({
            IGN: userData[0].mcName
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
  '/paxterya/staff/interface.html': _getters.interface,
  '/paxterya/staff/application.html': _getters.application,
  '/paxterya/staff/post.html': _getters.post,
  '/paxterya/statistics.html': _getters.statistics,
  '/paxterya/index.html': _getters.index,
  '/paxterya/application-sent.html': {
    'pax_title': 'Success!'
  },
  '/paxterya/contact-us.html': {
    'pax_title': 'Contact us!'
  },
  '/paxterya/join-us.html': {
    'pax_title': 'Join us!',
    'birthyears': _internal.generateBirthyearOptions
  },
  '/paxterya/member.html': {
    'pax_title': 'Member'
  },
  '/paxterya/members.html': {
    'pax_title': 'All Members'
  },
  '/paxterya/privacy-policy.html': {
    'pax_title': 'Privacy Policy'
  },
  '/paxterya/rules.html': {
    'pax_title': 'Rules'
  },
  '/paxterya/hardware.html': {
    'pax_title': 'Server Hardware'
  },
  '/paxterya/our-world.html': {
    'pax_title': 'Our World'
  },
  '/paxterya/town-of-paxterya.html': {
    'pax_title': 'Town of Paxterya'
  },
  '/paxterya/penliam.html': {
    'pax_title': 'Penliam'
  },
  '/paxterya/cookieville.html': {
    'pax_title': 'Cookieville'
  },
  '/paxterya/paxterdam.html': {
    'pax_title': 'Paxterdam'
  },
  '/paxterya/paxendorf.html': {
    'pax_title': 'Paxendorf'
  },
  '/paxterya/littleroot-city.html': {
    'pax_title': 'Littleroot City'
  },
  '/paxterya/faq.html': {
    'pax_title': 'FAQ'
  },
  '/paxterya/downloads.html': {
    'pax_title': 'Downloads'
  },
  '/widgets.html': _getters.widgets,


  '/landing/index.html': {
    'landing_videoID': global.newestVideo.id
  }
};

//Export the variables
module.exports = function(local_data, callback) {
  if(os.platform() != 'win32'){
    local_data.path = local_data.path.replace(__dirname, '').replace('/html', '');
  }else{
    local_data.path = local_data.path.replace(__dirname, '').replace('\\html', '').replace('\\','/').replace('\\','/').replace('\\','/');
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
