/*
 *  OAUTH2 WRAPPER
 *  This is the wrapper for oauth login
 */

//Dependencies
const config = require('./../config.js');
const qs     = require('querystring');
const https  = require('https');
const log    = require('./log.js');
const discord_helpers = require('./../discord-bot/discord_helpers.js');

//Create the container
var oauth = {};

//Takes a code and returns the discord_id
oauth.getDiscordIdFromCode = function(code, redirect, callback){
  oauth.getAccess_token(code, redirect, function(access_token){
    if(access_token){
      oauth.getUserObject(access_token, function(userObject){
        if(userObject){
          callback(userObject.id, access_token); //The access_token is only needed by oauth.isCodeAdmin
        }else{
          callback(false);
        }
      });
    }else{
      callback(false);
    }
  });
};

//Calls back true if the given access_token belongs to an admin
oauth.isTokenAdmin = function(access_token, callback){
  oauth.getUserObject(access_token, function(userObject){
    if(typeof userObject === 'object'){
      if(userObject.hasOwnProperty('id')){
        callback(discord_helpers.isAdmin(userObject.id));
      }else{
        callback(false);
      }
    }else{
      callback(false);
    }
  });
};

//Calls back true if the code belongs to an admin
oauth.isCodeAdmin = function(code, redirect, callback){
  oauth.getDiscordIdFromCode(code, redirect, function(discord_id, access_token){
    if(discord_id){
      if(discord_helpers.isAdmin(discord_id)){
        callback(true, access_token); //handlers.paxLogin sets the access_token as a cookie
      }else{
        callback(false);
      }
    }else{
      callback(false);
    }
  });
};

//Takes a code and returns the access_token
oauth.getAccess_token = function(code, redirect, callback){

  let redirect_uri = '';
  redirect_uri = redirect == 'application' ? config['discord_redirect_uri_application'] : redirect_uri;
  redirect_uri = redirect == 'staffLogin'  ? config['discord_redirect_uri_staffLogin'] : redirect_uri;

  //Now lets get the access_token from that code
  let payload = qs.stringify({
    'client_id': config['discord_client_id'],
    'client_secret': config['discord_client_secret'],
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': redirect_uri,
    'scope': 'identify guilds'
  });
  let req = https.request({
    host: 'discordapp.com',
    port: 443,
    path: '/api/oauth2/token',
    method: 'POST',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }, function(res){
    res.setEncoding('utf8');
    let data = '';
    res.on('data', function(chunk){
      data += chunk;
    }).on('end', function(){
      try{
        data = JSON.parse(data);
      }catch(e){
        callback(false);
      }
      let access_token = typeof data.access_token == 'string' ? data.access_token : false;
      if(access_token){
        callback(access_token);
      }else{
        callback(false);
      }
    });
    req.on('error', (e) => {
      log.write(2, 'oauth.getAccess_token encountered an error', {err: e});
      callback(false);
    });
  });

  req.write(payload);
  req.end();
};

//Get the user object from an access_token
oauth.getUserObject = function(access_token, callback){
  //Get the users object
  https.get({
    host: 'discordapp.com',
    port: 443,
    path: '/api/users/@me',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bearer ' + access_token
    }
  }, function(res){
    res.setEncoding('utf8');
    let userData = '';
    res.on('data', function(chunk){
      userData += chunk;
    }).on('end', function(){
      let success = false;
      try{
        userData = JSON.parse(userData);
        success = true;
      }catch(e){
        log.write(2, 'oauth.getUserObject encountered an error', {err: e});
        callback(false);
      }
      if(success) callback(userData);
    });
  });
};

oauth.getUserObjectById = function(id, callback){
  //Check if this id is already cached
  if(global.cache.discordUserObjects.hasOwnProperty(id)){
    //Its cached, return that
    callback(global.cache.discordUserObjects[id]);
  }else{
    //Get the users object
    https.get({
      host: 'discordapp.com',
      port: 443,
      path: '/api/users/' + id,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bot ' + config['bot-token']
      }
    }, function (res) {
      res.setEncoding('utf8');
      let userData = '';
      res.on('data', function (chunk) {
        userData += chunk;
      }).on('end', function () {
        let error = false
        try {
          userData = JSON.parse(userData);
        } catch (e) {
          log.write(2, 'oauth.getUserObject encountered an error', { err: e });
          error = false;
        }
        if (!error){
          global.cache.discordUserObjects[id] = userData;
          callback(userData);
        } 
        else callback(false);
      });
    });
  }
};

//Export the container
module.exports = oauth;
