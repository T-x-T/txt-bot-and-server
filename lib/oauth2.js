/*
 *  OAUTH2 WRAPPER
 *  This is the wrapper for oauth login
 */

//Dependencies
const config = require('./../config.js');
const qs     = require('querystring');
const https  = require('https');
const log    = require('./log.js');

//Create the container
var oauth = {};

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
  //Get the users object
  https.get({
    host: 'discordapp.com',
    port: 443,
    path: '/api/users/' + id,
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bot ' + config['bot-token']
    }
  }, function(res){
    res.setEncoding('utf8');
    let userData = '';
    res.on('data', function(chunk){
      userData += chunk;
    }).on('end', function(){
      try{
        userData = JSON.parse(userData);
        callback(userData);
      }catch(e){
        log.write(2, 'oauth.getUserObject encountered an error', {err: e});
        callback(false);
      }
    });
  });
};

//Export the container
module.exports = oauth;
