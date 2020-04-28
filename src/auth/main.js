/*
 *  OAUTH2 WRAPPER
 *  This is the wrapper for oauth login
 */

//Dependencies
const qs     = require('querystring');
const https  = require('https');
const discord_api = require('../discord_api');

var client;

emitter.once('discord_bot_ready', (_client) => {
  client = _client;
});


//Create the container
var oauth = {};

oauth.returnAccessLevel = function(userID){
  let access_level = 0;
  
  try{
    if(client.guilds.get(config.discord_bot.guild).members.get(userID).roles.has(config.discord_bot.roles.paxterya)) access_level = 3;
    if(client.guilds.get(config.discord_bot.guild).members.get(userID).roles.has(config.discord_bot.roles.admin)) access_level = 9;
  }catch(e){}

  global.log(0, 'auth', 'main.returnAcessLevel returned', {userID: userID, access_level: access_level});
  return access_level;
};

//Returns true if the given discord id is member of the guild and false if not
oauth.isGuildMember = function(userID){
  let is = client.guilds.get(config.discord_bot.guild).members.has(userID);
  global.log(0, 'auth', 'main.isGuildMember returned', {userID: userID, isGuildMember: is});
  return is
};

//Takes a code and returns the discord_id
oauth.getDiscordIdFromCode = function(code, redirect, callback){
  oauth.getAccess_token(code, redirect, function(err, access_token){
    if(access_token){
      oauth.getDiscordIdFromToken(access_token, callback);
    }else{
      callback('Couldnt get access_token for code: ' + code, false);
    }
  });
};

//Calls back true if the given access_token belongs to an admin
oauth.getTokenAccessLevel = function(access_token, callback){
  oauth.getDiscordIdFromToken(access_token, function(err, discord_id){
    let access_level = oauth.returnAccessLevel(discord_id);
    if(access_level){
      callback(false, access_level);
    }else{
      callback('Couldnt get access_level', false);
    }
  });
};

//Takes an access_token and returns the discord_id
oauth.getDiscordIdFromToken = function(access_token, callback) {
  discord_api.getUserObject({token: access_token}, false, function(err, userObject) {
    if(userObject.hasOwnProperty('id')) {
      callback(false, userObject.id, access_token); //The access_token is only needed by oauth.isCodeAdmin
    } else {
      callback('Couldnt get valid userObject, this is what we got: ' + userObject, false);
    }
  });
};

//Calls back true if the code belongs to an admin
oauth.getCodeAccessLevel = function(code, redirect, callback){
  oauth.getDiscordIdFromCode(code, redirect, function(err, discord_id, access_token){
    if(discord_id){
      callback(false, oauth.returnAccessLevel(discord_id), access_token); //handlers.paxLogin sets the access_token as a cookie
    }else{
      callback('Couldnt get valid discord_id, this is what we got: ' + discord_id, false);
    }
  });
};

//Takes a code and returns the access_token
oauth.getAccess_token = function(code, redirect, callback){

  let redirect_uri = '';
  redirect_uri = redirect == 'application' ? config.auth.discord_redirect_uri_application: redirect_uri;
  redirect_uri = redirect == 'staffLogin'  ? config.auth.discord_redirect_uri_staffLogin : redirect_uri;

  //Now lets get the access_token from that code
  let payload = qs.stringify({
    'client_id': config.auth.discord_client_id,
    'client_secret': config.auth.discord_client_secret,
    'grant_type': 'authorization_code',
    'code': code,
    'redirect_uri': redirect_uri,
    'scope': 'identify'
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
        callback(e, false);
      }
      let access_token = typeof data.access_token == 'string' ? data.access_token : false;
      if(access_token){
        callback(false, access_token);
      }else{
        callback('Access_token looks weird: ' + access_token, false);
      }
    });
    req.on('error', (e) => {
      global.log(2, 'auth', 'oauth.getAccess_token encountered an error', {err: e});
      callback(e, false);
    });
  });

  req.write(payload);
  req.end();
};

//Export the container
module.exports = oauth;
