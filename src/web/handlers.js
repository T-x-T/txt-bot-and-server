/*
*  HANDLERS
*  Contains all functions which handle web requests
*/

//Dependencies
const fs            = require('fs');
const path          = require('path');
const webHelpers    = require('./web-helpers.js');
const oauth         = require('../auth');
const discord_api   = require('../discord_api');
const stats         = require('../stats');
const blog          = require('../blog');
const MemberFactory = require('../user/memberFactory.js');
const memberFactory = new MemberFactory();
memberFactory.connect();
const ApplicationFactory = require('../application/applicationFactory.js');
const applicationFactory = new ApplicationFactory();
const mc_helpers = require('../minecraft');
const sanitize = require('sanitize-html');

//Create the container
var handlers = {};
handlers.paxapi = {};

//Not found handler
handlers.notFound = function (data, callback) {
  callback(404, 'The page you requested is not available', 'html');
};

//Handler for all paxterya html sites
handlers.paxterya = function (data, callback) {
  let origPath = data.path;
  if(Object.hasOwnProperty.bind(data.queryStringObject)('code')){
    //There is a access_code in the querystring, lets convert that to a discord_id and redirect to the same site, just with the id as a parameter
    _internal.redirectToDiscordId(data, function(status, file, type){ callback(status, file, type); });
  }else{
    //Its a normal website
    data.path = path.join(__dirname, '../../web/web/' + data.path);
    let site = 'paxterya';
    if(data.path.indexOf('index') > 0) site = 'paxteryaIndex';
    webHelpers.finishHtml(data, site, function (err, fileData) {
      if(!err && fileData.length > 0){
        callback(200, fileData, 'html');
      }else{
        //Nothing found, maybe its the index.html site?
        data.path = path.join(__dirname, '../../web/web/' + origPath + '/index.html');
        webHelpers.finishHtml(data, 'paxteryaIndex', function(err, fileData){
          if(!err && fileData.length > 0){
            callback(200, fileData, 'html');
          }else{
            //maybe that is without the .html?
            data.path = path.join(__dirname, '../../web/web/' + origPath + '.html');
            webHelpers.finishHtml(data, 'paxterya', function(err, fileData){
              if(!err && fileData.length > 0){
                callback(200, fileData, 'html');
              }else{
                //Nope someone wants to go somewhere, but that somewhere doesnt exist!
                callback(404, 'You tried to go somewhere that does not exist!', 'html');
              }
            });
          }
        });
      }
    });
  }
};

//Handlers for assets
handlers.assets = function (data, callback) {
  if (data.path.length > 0) {
    //Read in the asset
    fs.readFile(path.join(__dirname, '../../web/web/' + data.path), function (err, fileData) {
      if (!err && fileData) {
        //Choose the contentType and default to plain
        var contentType = 'plain';
        if (data.path.indexOf('.css') > -1) contentType = 'css';
        if (data.path.indexOf('.png') > -1) contentType = 'png';
        if (data.path.indexOf('.jpg') > -1) contentType = 'jpg';
        if (data.path.indexOf('.ico') > -1) contentType = 'favicon';
        if (data.path.indexOf('.ttf') > -1) contentType = 'font';
        if (data.path.indexOf('.svg') > -1) contentType = 'svg';
        if (data.path.indexOf('.js' ) > -1) contentType = 'js';

        callback(200, fileData, contentType);
      } else {
        callback(404);
      }
    });
  }
};

//Special handler for staff and member only sites
handlers.paxStaff = function(data, callback) {
  //Check if the user provided an access_token cookie
  if(data.cookies.access_token) {
    oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, access_level) {
      if(access_level >= 3) {
        //Everything is fine, serve the website
        data.path = path.join(__dirname, '../../web/web/' + data.path);
        webHelpers.finishHtml(data, 'paxterya', function(err, fileData) {
          if(!err && fileData.length > 0) {
            callback(200, fileData, 'html');
          } else {
            data.path = data.path + '.html';
            webHelpers.finishHtml(data, 'paxterya', function(err, fileData) {
              if(!err && fileData.length > 0) {
                callback(200, fileData, 'html');
              } else {
                callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
              }
            });
          }
        });
      } else {
        callback(302, {Location: config.auth.oauth_uris.login}, 'plain');
      }
    });
  } else {
    callback(302, {Location: config.auth.oauth_uris.login}, 'plain');
  }
};

//Special sauce for the login site to get the the token from the request string
handlers.paxLogin = function(data, callback){
  //Get the the code from the querystring
  let code = typeof data.queryStringObject.code == 'string' && data.queryStringObject.code.length == 30 ? data.queryStringObject.code : false;
  if(code){
    oauth.getAccessLevel({code: code}, {redirect: 'staffLogin'}, function(err, access_level, access_token){
      if(access_level >= 3){
        discord_api.getUserObject({token: access_token}, false, function(err, userData){
          memberFactory.getByDiscordId(userData.id)
          .then(member => {
            if(member){
              //Now set the access_token as a cookie and redirect the user to the interface.html, also set access_level and mc_ign cookies THIS SHOULD NEVER BE TRUSTED FOR SECURITY, ONLY FOR MAKING THINGS SMOOTHER!!!
              callback(302,
                {
                  Location: `https://${data.headers.host}/interface`,
                  'Set-Cookie': [`discord_id=${userData.id};Max-Age=21000};path=/`,
                  `access_token=${access_token};Max-Age=21000};path=/`,
                  `access_level=${access_level};Max-Age=22000};path=/`,
                  `mc_ign=${member.getMcIgn()};Max-Age=22000};path=/`]
                },
                'plain');
            }else{
              callback(401, 'Couldnt get your member object :/<br><a href="../">go back to safety</a>', 'html');
            }
          })
          .catch(e => {
            callback(500, e.message, 'plain');
          });
        });
      }else{
        callback(401, 'You are not authorized to view the member interface. Please login with the Discord account you are using on our server, if you are a member<br><a href="../">go back to safety</a>', 'html');
      }
    });
  }else{
    callback(500, 'the code obtained from discords oauth api is pretty weird, Im sorry :(', 'html');
  }
};

/*
*
* paxapi stuff
*
*/

//API endpoint for querying roles of players; Requires one uuid in the querystring
handlers.paxapi.roles = function(data, callback){
  memberFactory.getByMcUuid(data.queryStringObject.uuid)
  .then(member => {
    if(member) {
      callback(200, {role: oauth.getAccessLevel({id: member.getDiscordId()}, false)}, 'json');
    } else {
      callback(404, {}, 'json');
    }
  })
  .catch(e => {
    callback(500, {err: 'encountered error while trying to execute query: ' + e}, 'json');
  });
};

//API functionality for handling blog posts
handlers.paxapi.blog = function(data, callback) {
  if(typeof handlers.paxapi.blog[data.method] == 'function') {
    if(data.method === 'get' && data.queryStringObject.hasOwnProperty('public')) {
      //Only this case is allowed without auth
      handlers.paxapi.blog.getPublic(data, callback);
    } else {
      getRequestAuthorizationError(data, 9, err => {
        if(!err) {
          handlers.paxapi.blog[data.method](data, callback);
        } else {
          callback(401, {err: err}, 'json');
        }
      });
    }
  } else {
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

handlers.paxapi.blog.post = function(data, callback) {
  blog.create(data.payload)
    .then(res => callback(200, {doc: res}, 'json'))
    .catch(e => callback(500, {err: e.message}, 'json'));
};

handlers.paxapi.blog.put = function(data, callback) {
  blog.replace(data.payload)
    .then(res => callback(200, {doc: res}, 'json'))
    .catch(e => callback(500, {err: e.message}, 'json'));
}

handlers.paxapi.blog.get = function(data, callback) {
  blog.getAll()
    .then(res => callback(200, res, 'json'))
    .catch(e => callback(500, {err: e.message}, 'json'));
};

handlers.paxapi.blog.getPublic = function(data, callback) {
  blog.getPublic()
    .then(res => callback(200, res, 'json'))
    .catch(e => callback(500, {err: e.message}, 'json'));
};

//API functionallity surrounding member stuff
handlers.paxapi.member = function(data, callback){
  if(typeof handlers.paxapi.member[data.method] == 'function'){
    handlers.paxapi.member[data.method](data, callback);
  }else{
    callback(404, { err: 'Verb not allowed' }, 'json');
  }
};

//Retrieves member objects
handlers.paxapi.member.get = function(data, callback){
  let filter = {};
  if(data.queryStringObject.hasOwnProperty('id')) filter = filter['discord'] = id;
  //Retrieve the data with our custom made filter
  stats.get('memberOverview', {filter: filter}, function(err, docs){
    if(docs){
      callback(200, docs, 'json');
    }else{
      callback(500, {err: 'Couldnt retrieve data: ' + err}, 'json');
    }
  });
};

//API functionallity surrounding the contact form
handlers.paxapi.contact = function(data, callback){
  if(typeof handlers.paxapi.contact[data.method] == 'function'){
    handlers.paxapi.contact[data.method](data, callback);
  }else{
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

//To send a contact email
handlers.paxapi.contact.post = function(data, callback){
  //Check the inputs
  let name      = typeof data.payload.name == 'string' && data.payload.name.length > 0 ? data.payload.name : false;
  let recipient = typeof data.payload.email == 'string' && data.payload.email.length > 3 ? data.payload.email : false;
  let subject   = typeof data.payload.subject == 'string' && data.payload.subject.length > 0 ? data.payload.subject : false;
  let text      = typeof data.payload.text == 'string' && data.payload.text.length > 10 ? data.payload.text : false;

  if(name && recipient && subject && text){
    //Add the email of the sender to the text
    text = text + '\n\n' + recipient;

    //Send the email
    emitter.emit('contact_new', subject, text);

    callback(200, {}, 'json');
  }else{
    callback(400, {err: 'One of your inputs is a little off'}, 'json');
  }
};

handlers.paxapi.application = function(data, callback){
  if(typeof handlers.paxapi.application[data.method] == 'function'){
    if(data.method != 'post') {
      //All non post requests require authorization
      //Check if there is an access_token
      if(data.headers.hasOwnProperty('cookie')){
        if(data.headers.cookie.indexOf('access_token'.length > -1)){
          //There is an access_token cookie, lets check if it belongs to at least a mod
          oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, access_level){
            if(access_level >= 7){
              //The requester is allowed to get the records
              handlers.paxapi.application[data.method](data, callback);
            }else{
              callback(403, {err: 'You are not authorized to do that!'}, 'json');
            }
          });
        }else{
          callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
        }
      }else{
        callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
      }
    }else{
      handlers.paxapi.application[data.method](data, callback);
    }
  }else{
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

//To send a new application
handlers.paxapi.application.post = function(data, callback){
  if(!data.payload || !data.payload.accept_rules || !data.payload.accept_privacy_policy){
    callback(400, {err: "Missing or malformed payload", payload: data.payload}, "json");
    return;
  }
  
  let discordId = data.payload.discord_id.length >= 17 && data.payload.discord_id.length <= 18 ? data.payload.discord_id : false;
  let emailAddress = data.payload.email_address.indexOf("@") > -1 && data.payload.email_address.length > 5 ? data.payload.email_address.trim() : false;
  let country = data.payload.country ? sanitize(data.payload.country, {allowedTags: [], allowedAttributes: []}) : false;
  let birthMonth = Number.parseInt(data.payload.birth_month) >= 1 && Number.parseInt(data.payload.birth_month) <= 12 ? Number.parseInt(data.payload.birth_month) : false;
  let birthYear = Number.parseInt(data.payload.birth_year) >= 1900 && Number.isInteger(Number.parseInt(data.payload.birth_year)) ? Number.parseInt(data.payload.birth_year) : false;
  let aboutMe = data.payload.about_me.length > 1 && data.payload.about_me.length <= 1500 ? sanitize(data.payload.about_me, {allowedTags: [], allowedAttributes: {}}) : false;
  let motivation = data.payload.motivation.length > 1 && data.payload.motivation.length <= 1500 ? sanitize(data.payload.motivation, {allowedTags: [], allowedAttributes: {}}) : false;
  let buildImages = data.payload.build_images.length > 1 && data.payload.build_images.length <= 1500 ? sanitize(data.payload.build_images, {allowedTags: [], allowedAttributes: {}}) : false;
  let publishAboutMe = data.payload.publish_about_me;
  let publishAge = data.payload.publish_age;
  let publishCountry = data.payload.publish_country;
  
  if(birthYear > new Date().getFullYear() - 13 || (birthYear > new Date().getFullYear() - 12 && new Date().getMonth() < birthMonth)){
    callback(401, {err: "you need to be at least 13 years old to apply. If you believe this is an error contact TxT#0001 in Discord"}, "json");
    return;
  }
  
  if(!discordId || !data.payload.mc_ign || !emailAddress || !country || !birthMonth || !birthYear || !aboutMe || !motivation || !buildImages){
    callback(400, {err: "Incorrect input"}, "json");
    global.log(0, "web", "handlers.paxapi.application.post received incorrect input", {
      discordId: discordId,
      mc_ign: mc_ign,
      emailAddress: emailAddress,
      country: country,
      birthMonth: birthMonth,
      birthYear: birthYear,
      aboutMe: aboutMe,
      motivation: motivation,
      buildImages: buildImages
    });
    return;
  }
  mc_helpers.getUUID(data.payload.mc_ign, (err, mcUuid) => {
    if(!err && mcUuid){
      mc_helpers.getIGN(mcUuid, (err, mcIgn) => {
        if(!err && mcIgn){
          discord_api.getUserObjectByIdFromApi(data.payload.discord_id, userData => {
            if(userData) {
              let discordUserName = `${userData.username}#${userData.discriminator}`;
              applicationFactory.create(discordId, mcUuid, emailAddress, country, birthMonth, birthYear, aboutMe, motivation, buildImages, publishAboutMe, publishAge, publishCountry, 1, discordUserName, mcIgn)
                .then(() => {
                  callback(201, {}, "json");
                })
                .catch(e => {
                  callback(500, {err: e.message}, "json");
                });
            } else {
              callback(500, {err: "Couldnt get your nickname from Discord :( Please contact TxT#0001 on Discord if you read this", payload: data.payload}, "json");
            }
          });
        }else{
          callback(500, {err: err}, "json");
        }
      });
    }else{
      callback(400, {err: "No Minecraft Account for given Minecraft In-Game-Name found", payload: data.payload}, "json");
    }
  });
};

//Retrieves a list of applications
//REQUIRES AUTHORIZATION!
//Required data: none - this will return all applications
//Optional id, discord, discord_id, mc_ign, status - these are filters, only return records matching the filter
handlers.paxapi.application.get = function(data, callback){
  //Retrieve all records
  //Clear the 0 status code, as 0 means get all data
  if(data.queryStringObject.status == 0) data.queryStringObject = undefined;
  turnFilterIntoApplicationAndCallbackResult(data.queryStringObject, callback)
};

async function turnFilterIntoApplicationAndCallbackResult(filter, callback){
  switch(Object.keys(filter)[0]) {
    case "id":
      applicationFactory.getById(filter.id)
        .then(async application => {
          if(application) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no application found with the given id", id: filter.id}, "json");
          }
        })
        .catch(e => {
          callback(500, {err: e.message}, "json");
        })
        .catch(e => callback(500, {err: e.message}, 'json'));
      break;
    case "discord_id":
      applicationFactory.getByDiscordId(filter.discord_id)
        .then(async applications => {
          if(applications.length > 0) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no application found with the given discord_id", discord_id: filter.discord_id}, "json");
          }
        })
        .catch(e => {
          callback(500, {err: e.message}, "json");
        })
      break;
    case "mc_uuid":
      applicationFactory.getByMcUuid(filter.mc_uuid)
        .then(async applications => {
          if(applications.length > 0) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no application found with the given mc_uuid", mc_uuid: filter.mc_uuid}, "json");
          }
        })
        .catch(e => {
          callback(500, {err: e.message}, "json");
        })
      break;
    default:
      applicationFactory.getFiltered({})
        .then(async applications => {
          if(applications.length > 0) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no applications found"}, "json");
          }
        })
        .catch(e => {
          callback(500, {err: e.message}, "json");
        })
      break;
  }
}

async function turnApplicationsIntoJson(applications) {
  let applicationObjects = [];
  (await Promise.all(applications.map(async application => await turnApplicationIntoJson(application)))).forEach(application => {
    if(application) applicationObjects.push(application);
  });
  return applicationObjects;
}

async function turnApplicationIntoJson(application){
  if(application.getTimestamp().valueOf() < (Date.now() - (1000 * 60 * 60 * 24 * 14))) return null;
  let discordAvatarUrl = await application.getDiscordAvatarUrl();
  return {
    id: application.getId(),
    timestamp: application.getTimestamp().valueOf(),
    mc_uuid: application.getMcUuid(),
    discord_id: application.getDiscordId(),
    country: application.getCountry(),
    birth_month: application.getBirthMonth(),
    birth_year: application.getBirthYear(),
    about_me: application.getAboutMe(),
    motivation: application.getMotivation(),
    build_images: application.getBuildImages(),
    publish_about_me: application.getPublishAboutMe(),
    publish_age: application.getPublishAge(),
    publish_country: application.getPublishCountry(),
    discord_nick: application.getDiscordUserName(),
    mc_ign: application.getMcIgn(),
    status: application.getStatus(),
    mc_skin_url: application.getMcSkinUrl(),
    discord_avatar_url: discordAvatarUrl
  };
}

//To change the status of a single application
//REQUIRES AUTHORIZATION!
//Required data: id, new status (2 or 3)
handlers.paxapi.application.patch = function(data, callback){
  //Check if the required fields are set
  let id     = typeof data.payload.id     == 'number' && data.payload.id     > -1 ? data.payload.id     : false;
  let status = typeof data.payload.status == 'number' && data.payload.status >= 2 && data.payload.status <= 3 ? data.payload.status : false;

  if(typeof id == 'number' && status){
    applicationFactory.getById(id)
    .then(async application => {
      if(application){
        if(application.getStatus() !== 2){
          if(status === 3){
            await application.accept();
            callback(200, {}, "json");
          } else {
            await application.deny(data.payload.reason);
            callback(200, {}, "json");
          }
        }else{
          callback(401, {err: "The application got already decided upon. Please refresh your browser!"}, "json");
        }
      }else{
        callback(404, {err: "No application with given id found", id: id}, "json");
      }
    })
    .catch(e => {
      callback(500, {err: e.message}, "json");
    });
  }else{
    callback(401, {err: 'One of the inputs is not quite right'}, 'json');
  }
};

handlers.paxapi.mcversion = function(data, callback){
  mc_helpers.getServerVersion((version) => {
    if(version){
      callback(200, version, "plain");
    }else{
      callback(500, {err: "Couldnt get version"}, "json");
    }
  });
}

handlers.paxapi.memberworldmapdata = function(data, callback) {
  stats.get("countryList", false, function(err, map_data){
    if(!err){
      callback(200, map_data, "json");
    }else{
      callback(500, {err: "Couldnt get map data", details: err}, "json");
    }
  });
}

handlers.paxapi.statsoverview = function(data, callback){
  stats.get("overview", false, function(err, stats){
    if(!err && stats){
      callback(200, stats, "json");
    }else{
      callback(500, {err: "failed to get stats overview", stats: stats, details: err}, "json");
    }
  });
}

//Internal helper functions to make code cleaner
var _internal = {};

//Redirect user to the same url with the discord_id as queryStringObject
_internal.redirectToDiscordId = function(data, callback){
  let code = data.queryStringObject.code;
  oauth.getDiscordId({code: code}, {redirect: 'application'}, function(err, id){
    if(id){
      callback(302, {Location: `https://${data.headers.host}/${data.path.replace('/html/', '')}?id=${id}`}, 'plain');
    }else{
      callback(500, 'Couldnt get your user data from discord', 'html');
    }
  });
};

function getRequestAuthorizationError(data, minAccessLevel, callback) {
  if(data.headers.hasOwnProperty('cookie')) {
    if(data.headers.cookie.indexOf('access_token'.length > -1)) {
      //There is an access_token cookie, lets check if it belongs to an admin
      oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, accessLevel) {
        if(accessLevel >= minAccessLevel) {
          callback(false)
        } else {
          callback('You are not authorized to access this resource');
        }
      });
    } else {
      callback('Your client didnt send an access_token, please log in again');
    }
  } else {
    callback('Your client didnt send an access_token, please log in again');
  }
}

//Export the container
module.exports = handlers;
