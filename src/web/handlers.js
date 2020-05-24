/*
*  HANDLERS
*  Contains all functions which handle web requests
*/

//Dependencies
const fs          = require('fs');
const path        = require('path');
const webHelpers  = require('./web-helpers.js');
const application = require('../application');
const oauth       = require('../auth');
const discord_api = require('../discord_api');
const stats       = require('../stats');
const post        = require('../post');
const bulletin    = require('../bulletin');
const user        = require('../user');

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
          user.get({discord: userData.id}, {privacy: true, onlyPaxterians: true, first: true}, function(err, memberData){
            //Now set the access_token as a cookie and redirect the user to the interface.html, also set access_level and mc_ign cookies THIS SHOULD NEVER BE TRUSTED FOR SECURITY, ONLY FOR MAKING THINGS SMOOTHER!!!
            callback(302, {Location: `https://${data.headers.host}/interface`, 'Set-Cookie': [`access_token=${access_token};Max-Age=21000};path=/`, `access_level=${access_level};Max-Age=22000};path=/`, `mc_ign=${memberData.mcName};Max-Age=22000};path=/`]}, 'plain');
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
  user.get({mcUUID: data.queryStringObject.uuid}, {first: true}, function(err, doc){
    if(!err){
      if(doc){
        callback(200, {role: oauth.getAccessLevel({id: doc.discord}, false)}, 'json'); 
      }else{
        callback(404, {}, 'json');
      }
    }else{
      callback(500, {err: 'encountered error while trying to execute query: ' + err}, 'json');
    }
  });
};

//API functionality for handling the bulletin categories
//Auth: access_level >= 3
handlers.paxapi.bulletinCategory = function(data, callback){
  if(typeof handlers.paxapi.bulletinCategory[data.method] == 'function'){
    //Check if user is authorized to send that request
    if(data.cookies.access_token){
      oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, access_level) {
        if(access_level >= 3){
          //Add access_level to data, to allow edits by admins (>=9)
          data.access_level = access_level;

          //User is authorized
          handlers.paxapi.bulletin[data.method](data, callback);
        }else{
          callback(403, {err: 'You are not authorized to do that!'}, 'json');
        }
      });
    }else{
      callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
    }
  }else{
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

handlers.paxapi.bulletinCategory.get = function(data, callback){
  bulletin.getCategories(false, false, function(err, docs){
    if(docs) callback(200, docs, 'json');
    else callback(404, {err: 'Couldnt get any posts for the filter'}, 'json');
  });
};


//API functionality for handling the bulletin cards
//Auth: access_level >= 3
handlers.paxapi.bulletin = function(data, callback){
  if(typeof handlers.paxapi.bulletin[data.method] == 'function'){
    //Check if user is authorized to send that request
    if(data.cookies.access_token){
      oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, access_level) {
        if(access_level >= 3){
          //Add access_level to data, to allow edits by admins (>=9)
          data.access_level = access_level;

          //User is authorized
          handlers.paxapi.bulletin[data.method](data, callback);
        }else{
          callback(403, {err: 'You are not authorized to do that!'}, 'json');
        }
      });
    }else{
      callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
    }
  }else{
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

//Save a new bulletin
handlers.paxapi.bulletin.post = function(data, callback){
  //Get the discord id of the author
  oauth.getDiscordId({token: data.cookies.access_token}, false, function(err, discord_id){
    if(discord_id){
      data.payload.author = discord_id;
      bulletin.save(data.payload, false, function(err, doc){
        if(!err && doc){
          callback(200, doc, 'json');
        }else{
          callback(500, {err: err}, 'json');
        }
      });
    }else{
      callback(500, {err: 'Failed to get discord_id for user'}, 'json');
    }
  });
};

//Update an existing bulletin
handlers.paxapi.bulletin.put = function(data, callback){
  //Get the discord id of the author
  oauth.getDiscordId({token: data.cookies.access_token}, false, function(err, discord_id) {
    if(discord_id) {
      //Edit
      data.payload.editAuthor = discord_id;
      bulletin.save(data.payload, false, function(err, doc){
        if(err){
          callback(403, {err: err}, 'json');
        }else{
          callback(200);
        }
      });
    } else {
      callback(500, {err: 'Failed to get discord_id for user'}, 'json');
    }
  });
};

//Get bulletin(s) based on filter
//Update an existing bulletin
handlers.paxapi.bulletin.get = function(data, callback) {
  bulletin.getCards(false, false, function(err, docs) {
    if(docs) callback(200, docs, 'json');
    else callback(404, {err: 'Couldnt get any posts for the filter'}, 'json');
  });
};

//Remove bulletin
handlers.paxapi.bulletin.delete = function(data, callback) {
  //Get the discord id of the author
  oauth.getDiscordId({token: data.cookies.access_token}, false, function(err, discord_id) {
    if(discord_id) {
      //Delete
      data.payload.deleteAuthor = discord_id;
      bulletin.delete(data.payload, false, function(err){
        if(err){
          callback(403, {err: err}, 'json');
        }else{
          callback(200);
        }
      });
    } else {
      callback(500, {err: 'Failed to get discord_id for user'}, 'json');
    }
  });
};

//API functionality for handling blog posts
handlers.paxapi.post = function(data, callback) {
  if(typeof handlers.paxapi.post[data.method] == 'function') {
    handlers.paxapi.post[data.method](data, callback);
  } else {
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

//Save a new/modified post to the database (ADMIN ONLY!)
handlers.paxapi.post.post = function(data, callback){
  //Check if there is an access_token
  if(data.headers.hasOwnProperty('cookie')) {
    if(data.headers.cookie.indexOf('access_token'.length > -1)) {
      //There is an access_token cookie, lets check if it belongs to an admin
      oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, access_level) {
        if(access_level >= 9) {
          //The requester is allowed to post the records
          post.save(data.payload, false, function(err, doc){
            if(err) callback(500, {err: err}, 'json');
              else callback(200, {doc: doc}, 'json');
          });
        } else {
          callback(403, {err: 'You are not authorized to do that!'}, 'json');
        }
      });
    } else {
      callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
    }
  } else {
    callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
  }
};

//Get posts
handlers.paxapi.post.get = function(data, callback){
  post.get(data.queryStringObject, false, function(err, posts){
    if(posts) callback(200, posts, 'json');
    else callback(404, {err: 'Couldnt get any posts for the filter'}, 'json');
  });
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
          //There is an access_token cookie, lets check if it belongs to an admin
          oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err, access_level){
            if(access_level >= 9){
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
  application.save(data.payload, false, function(status, err){
    if(!err){
      callback(status, {}, 'json');
    }else{
      callback(status, {err: err}, 'json');
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
  application.get(data.queryStringObject, false, function(err, docs){
    if(!err){
      callback(200, docs, 'json');
    }else{
      callback(500, {err: 'Couldnt get any records from the database'}, 'json');
    }
  });
};

//To change the status of a single application
//REQUIRES AUTHORIZATION!
//Required data: id, new status (2 or 3)
handlers.paxapi.application.patch = function(data, callback){
  //Check if the required fields are set
  let id     = typeof data.payload.id     == 'number' && data.payload.id     > -1 ? data.payload.id     : false;
  let status = typeof data.payload.status == 'number' && data.payload.status >= 2 && data.payload.status <= 3 ? data.payload.status : false;

  if(typeof id == 'number' && status){
    //Hand it over to the correct function
    application.save(data.payload, false, function(status, err){
      if(!err){
        callback(200, {}, 'json');
      }else{
        callback(500, {err: err}, 'json');
      }
    });
  }else{
    callback(401, {err: 'One of the inputs is not quite right'}, 'json');
  }
};

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

//Export the container
module.exports = handlers;
