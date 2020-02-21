/*
*  HANDLERS
*  Contains all functions which handle web requests
*/

//Dependencies
const config      = require('./../config.js');
const fs          = require('fs');
const path        = require('path');
const webHelpers  = require('./web-helpers.js');
const application = require('./../lib/application.js');
const oauth       = require('./../lib/oauth2.js');
const email       = require('./../lib/email.js');
const stats       = require('./../lib/stats.js');
const post        = require('./../lib/post.js');
const bulletin    = require('./../lib/bulletin.js');

//Create the container
var handlers = {};
handlers.paxapi = {};

//Not found handler
handlers.notFound = function (data, callback) {
  callback(404, 'The page you requested is not available', 'html');
};

//Handler for landing html sites
handlers.landing = function (data, callback){
  fs.readFile(path.join(__dirname, './html/' + data.path), 'utf8', function (err, fileData) {
    if (!err && fileData.length > 0) {
      webHelpers.insertVariables(data, fileData, function(err, newFileData){
        if(!err && fileData.length > 0){
          callback(200, newFileData, 'html');
        }else{
          callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
        }
      });
    } else {
      fs.readFile(path.join(__dirname, './html/' + data.path + '/index.html'), 'utf8', function (err, fileData) {
        if (!err && fileData.length > 0) {
          data.path += 'index.html';
          webHelpers.insertVariables(data, fileData, function(err, newFileData){
            if(!err && fileData.length > 0){
              callback(200, newFileData, 'html');
            }else{
              callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
            }
          })
        } else {
          callback(404, 'html handler couldnt find the file', 'html');
        }
      });
    }
  });
};

//Handler for all paxterya html sites
handlers.paxterya = function (data, callback) {
  let origPath = data.path;
  if(Object.hasOwnProperty.bind(data.queryStringObject)('code')){
    //There is a access_code in the querystring, lets convert that to a discord_id and redirect to the same site, just with the id as a parameter
    _internal.redirectToDiscordId(data, function(status, file, type){ callback(status, file, type); });
  }else{
    //Its a normal website
    data.path = path.join(__dirname, './html/' + data.path);
    webHelpers.finishHtml(data, 'paxterya', function (err, fileData) {
      if(!err && fileData.length > 0){
        callback(200, fileData, 'html');
      }else{
        //Nothing found, maybe its the index.html site?
        data.path = path.join(__dirname, './html/' + origPath + '/index.html');
        webHelpers.finishHtml(data, 'paxterya', function(err, fileData){
          if(!err && fileData.length > 0){
            callback(200, fileData, 'html');
          }else{
            //maybe that is without the .html?
            data.path = path.join(__dirname, './html/' + origPath + '.html');
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
    fs.readFile(path.join(__dirname, './html/' + data.path), function (err, fileData) {
      //console.log(data.path);
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

//Special handler for staff only sites
handlers.paxStaff = function(data, callback){
  //Check if the user provided an access_token cookie
  if(data.headers.hasOwnProperty('cookie')){
    if(data.headers.cookie.indexOf('access_token' > -1)){
      let access_token = data.headers.cookie.split('=')[1];
      oauth.getTokenAccessLevel(access_token, function(access_level){
        if(data.path.indexOf('application') > -1 && access_level >= 9 || data.path.indexOf('post') > -1 && access_level >= 9 || data.path.indexOf('interface') > -1 && access_level >= 3 || data.path.indexOf('blackboard') > -1 && access_level >= 3){
          //Everything is fine, serve the website
          data.path = path.join(__dirname, './html/' + data.path);
          webHelpers.finishHtml(data, 'paxterya', function(err, fileData){
            if(!err && fileData.length > 0){
              callback(200, fileData, 'html');
            }else{
              callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
            }
          });
        }else{
          callback(302, {Location: config.oauth_uris.login}, 'plain');
        }
      });
    }else{
      callback(302, {Location: config.oauth_uris.login}, 'plain');
    }
  }else{
    callback(302, {Location: config.oauth_uris.login}, 'plain');
  }
};

//Special sauce for the login site to get the the token from the request string
handlers.paxLogin = function(data, callback){
  //Get the the code from the querystring
  let code = typeof data.queryStringObject.code == 'string' && data.queryStringObject.code.length == 30 ? data.queryStringObject.code : false;
  if(code){
    oauth.getCodeAccessLevel(code, 'staffLogin', function(access_level, access_token){
      if(access_level >= 3){
        //Now set the access_token as a cookie and redirect the user to the interface.html
        callback(302, {Location: `https://${data.headers.host}/staff/interface.html`, 'Set-Cookie': `access_token=${access_token};expires=${new Date(Date.now() + 1000 * 60 * 60 * 6).toGMTString()};path=/`}, 'plain');
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

//API functionality for handling the bulletin board
//Auth: access_level >= 3
handlers.paxapi.bulletin = function(data, callback){
  if(typeof handlers.paxapi.bulletin[data.method] == 'function'){
    //Check if user is authorized to send that request
    if(data.headers.hasOwnProperty('cookie') && data.headers.cookie.indexOf('access_token' > -1)){
      oauth.getTokenAccessLevel(data.headers.cookie.split('=')[1], function(access_level) {
        if(access_level >= 3){
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
  oauth.getDiscordIdFromToken(data.headers.cookie.split('=')[1], function(discord_id){
    if(discord_id){
      data.payload.author = discord_id;
      bulletin.save(data.payload, function(err, doc){
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
  oauth.getDiscordIdFromToken(data.headers.cookie.split('=')[1], function(discord_id) {
    if(discord_id) {
      //Check if discord_id is the same as author from the database
      bulletin.get({_id: data.payload._id}, function(err, docs){
        if(!err && docs){
          if(docs[0].author === discord_id){
            //Everything in order, save to db
            bulletin.save(data.payload, function(err, doc) {
              if(!err && doc) {
                callback(200, doc, 'json');
              } else {
                callback(500, {err: err}, 'json');
              }
            });
          }else{
            callback(403, {err: 'Youre not the author of the object you tried to modify'}, 'json');
          }
        }else{
          callback(500, {err: 'Failed to verify that youre the author'}, 'json');
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
  bulletin.get(data.queryStringObject, function(err, docs) {
    if(docs) callback(200, docs, 'json');
    else callback(404, {err: 'Couldnt get any posts for the filter'}, 'json');
  });
};

//Remove bulletin
handlers.paxapi.bulletin.delete = function(data, callback) {
  //Get the discord id of the author
  oauth.getDiscordIdFromToken(data.headers.cookie.split('=')[1], function(discord_id) {
    if(discord_id) {
      //Check if discord_id is the same as author from the database
      bulletin.get({_id: data.payload._id}, function(err, docs) {
        if(!err && docs) {
          if(docs[0].author === discord_id) {
            //Everything in order, save to db
            bulletin.remove(data.payload, function(err, doc) {
              if(!err && doc) {
                callback(200, doc, 'json');
              } else {
                callback(500, {err: 'Error saving new entry to database'}, 'json');
              }
            });
          } else {
            callback(403, {err: 'Youre not the author of the object you tried to modify'}, 'json');
          }
        } else {
          callback(500, {err: 'Failed to verify that youre the author'}, 'json');
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
    if(data.headers.cookie.indexOf('access_token' > -1)) {
      //There is an access_token cookie, lets check if it belongs to an admin
      oauth.getTokenAccessLevel(data.headers.cookie.split('=')[1], function(access_level) {
        if(access_level >= 9) {
          //The requester is allowed to post the records
          post.save(data.payload, function(err){
            if(err) callback(500, err, 'plain');
              else callback(200, '', 'plain');
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
  post.get(data.queryStringObject, function(posts){
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
  stats.memberOverview(false, filter, function(docs){
    if(docs){
      callback(200, docs, 'json');
    }else{
      callback(500, {err: 'Couldnt retrieve data'}, 'json');
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
    email.send('contact@paxterya.com', subject, text);
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
        if(data.headers.cookie.indexOf('access_token' > -1)){
          //There is an access_token cookie, lets check if it belongs to an admin
          oauth.getTokenAccessLevel(data.headers.cookie.split('=')[1], function(access_level){
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
  application.write(data.payload, function(status, err){
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
  application.readAll(data.queryStringObject, function(err, docs){
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
  let reason = typeof data.payload.reason == 'string' && data.payload.reason.length > 0 ? data.payload.reason : false;

  if(typeof id == 'number' && status){
    //Hand it over to the correct function
    application.changeStatus(id, status, reason, function(status, err){
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
  oauth.getDiscordIdFromCode(code, 'application', function(id){
    if(id){
      callback(302, {Location: `https://${data.headers.host}/${data.path.replace('/paxterya/', '')}?id=${id}`}, 'plain');
    }else{
      callback(500, 'Couldnt get your user data from discord', 'html');
    }
  });
};

//Export the container
module.exports = handlers;
