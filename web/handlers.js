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
const discord     = require('./../discord-bot/discord_helpers.js');

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
            //Nope someone wants to go somewhere, but that somewhere doesnt exist!
            callback(404, 'You tried to go somewhere that does not exist!', 'html');
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
      oauth.isTokenAdmin(access_token, function(isAdmin){
        if(isAdmin){
          //Everything is fine, serve the website
          data.path = path.join(__dirname, './html/' + data.path);
          webHelpers.finishHtml(data, 'paxteryaStaff', function(err, fileData){
            if(!err && fileData.length > 0){
              callback(200, fileData, 'html');
            }else{
              callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
            }
          });
        }else{
          callback(403, 'You first have to become an admin before accessing this site!!', 'html');
        }
      });
    }else{
      callback(302, {Location: 'https://discordapp.com/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Flocalhost%3A3001%2Flogin.html&response_type=code&scope=identify%20guilds'}, 'plain');
    }
  }else{
    callback(302, {Location: 'https://discordapp.com/oauth2/authorize?client_id=624980994889613312&redirect_uri=https%3A%2F%2Flocalhost%3A3001%2Flogin.html&response_type=code&scope=identify%20guilds'}, 'plain');
  }
};

//Special sauce for the login site to get the the token from the request string
handlers.paxLogin = function(data, callback){
  //Get the the code from the querystring
  let code = typeof data.queryStringObject.code == 'string' && data.queryStringObject.code.length == 30 ? data.queryStringObject.code : false;
  if(code){
    oauth.isCodeAdmin(code, 'staffLogin', function(isAdmin, access_token){
      if(isAdmin){
        //Now set the access_token as a cookie and redirect the user to the interface.html
        callback(302, {Location: `https://${data.headers.host}/staff/interface.html`, 'Set-Cookie': 'access_token=' + access_token + ';path=/'}, 'plain');
      }else{
        callback(403, 'You first have to become an admin before accessing this site!!', 'html');
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

handlers.paxapi.application = {};

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

//To retrieve a list of applications
//REQUIRES AUTHORIZATION!
//Required data: none - this will return all applications
//Optional id, discord, discord_id, mc_ign, status - these are filters, only return records matching the filter
handlers.paxapi.application.get = function(data, callback){
  //Check if there is an access_token
  if(data.headers.hasOwnProperty('cookie')){
    if(data.headers.cookie.indexOf('access_token' > -1)){
      //There is an access_token cookie, lets check if it belongs to an admin
      oauth.isTokenAdmin(data.headers.cookie.split('=')[1], function(isAdmin){
        if(isAdmin){
          //The requester is allowed to get the records
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
};

//To change the status of a single application
//REQUIRES AUTHORIZATION!
//Required data: id, new status (2 or 3)
handlers.paxapi.application.patch = function(data, callback){
  //Check if there is an access_token
  if(data.headers.hasOwnProperty('cookie')){
    if(data.headers.cookie.indexOf('access_token' > -1)){
      //Check if the required fields are set
      let id     = typeof data.payload.id     == 'number' && data.payload.id     > -1 ? data.payload.id     : false;
      let status = typeof data.payload.status == 'number' && data.payload.status >= 2 && data.payload.status <= 3 ? data.payload.status : false;
      let reason = typeof data.payload.reason == 'string' && data.payload.reason.length > 0 ? data.payload.reason : false;
      if(typeof id == 'number' && status){
        //There is an access_token cookie, lets check if it belongs to an admin
        let access_token = data.headers.cookie.split('=')[1];
        oauth.isTokenAdmin(data.headers.cookie.split('=')[1], function(isAdmin){
          if(isAdmin){
            //Hand it over to the correct function
            application.changeStatus(id, status, reason, function(status, err){
              if(!err){
                callback(status, {}, 'json');
              }else{
                callback(status, {err: err}, 'json');
              }
            });
          }else{
            callback(403, {err: 'You are not authorized to do that!'}, 'json');
          }
        });
      }else{
        callback(401, {err: 'One of the inputs is not quite right'}, 'json');
      }
    }else{
      callback(401, {err: 'You need to send your access_token'}, 'json');
    }
  }else{
    callback(401, {err: 'You need to send your access_token'}, 'json');
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
