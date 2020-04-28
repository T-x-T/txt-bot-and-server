/*
 *  MAIN FILE OF THE DISCORD_API COMPONENT
 *  The discord_api component contains functions to communicate with the discord api, outside of the scope from what discordjs provides and not including oauth
 */

//Dependencies
const https = require('https');

//Create the container
var main = {};

var client;

emitter.on('discord_bot_ready', (_client) => {
  client = _client;
});

//Get the user object from an access_token
main.getUserObject = function(access_token, callback){
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
        global.log(2, 'discord_api', 'oauth.getUserObject encountered an error', {err: e});
        callback(e, false);
      }
      if(success) callback(false, userData);
      else callback('Some error that shouldnt happen, well, happened', false)
    });
  });
};

main.getUserObjectById = function(id, options, callback) {
  //Check if this id is already cached
  if(global.cache.discordUserObjects.hasOwnProperty(id)) {
    //Its cached, return that
    callback(false, global.cache.discordUserObjects[id]);
  } else {
    if(options.fromApi){
      //Ask the api anyways
      main.getUserObjectByIdFromApi(id, function(userData){
        if(userData){
          callback(false, userData);
        }else{
          callback('Couldnt get object from api', false);
        }
      });
    }else{
      //Its not cached, so we are probably still working on it (:
      callback('The username isnt cached yet', {username: 'load', discriminator: 'ing'})
    }
  }
};

main.updateUserIdCache = function() {
  //Needs to be imported here, otherwise data hasnt initialized or something like that
  const user = require('../user');

  //Get all discord Ids
  user.get({}, false, function(err, docs) {
    //Update the cache for each user
    i = 0;
    docs.forEach((doc) => {
      i = i + 1000;
      setTimeout(function() {
        main.getUserObjectByIdFromApi(doc.discord, function(userObject) {
          global.cache.discordUserObjects[userObject.id] = userObject;
        });
      }, i);
    });
  });
};

//Get userObject by ID directly from api WITHOUT caching, NEVER EVER use this, unless you are 100% sure and asked TxT
main.getUserObjectByIdFromApi = function(id, callback) {
  //Get the users object
  https.get({
    host: 'discordapp.com',
    port: 443,
    path: '/api/users/' + id,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Bot ' + config.discord_bot.bot_token
    }
  }, function(res) {
    res.setEncoding('utf8');
    let userData = '';
    res.on('data', function(chunk) {
      userData += chunk;
    }).on('end', function() {
      let error = false
      try {
        userData = JSON.parse(userData);
      } catch(e) {
        global.log(2, 'discord_api', 'oauth.getUserObject encountered an error', {err: e});
        error = true;
      }
      if(!error) {
        //Check if we got rate-limited
        if(userData.hasOwnProperty("retry_after")) {
          //We got rate-limited, try again after it expired
          setTimeout(function() {
            main.getUserObjectById(id, false, function(_userData) {
              callback(_userData);
            });
          }, userData.retry_after + 10);

        } else {
          //No rate-limits
          global.cache.discordUserObjects[userData.id] = userData;
          callback(userData);
        }
      }else {
        callback(false);
      }
    });
  });
};

main.getNicknameByID = function (userID, callback) {
  try {
    callback(`${client.guilds.get(config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(config.discord_bot.guild).members.get(userID).user.discriminator}`);
  } catch (e) {
    console.log(0, 'discord_api', 'main.getNicknameByID encountered an error', {err: e, userID: userID});
    callback(false);
  }
};

//Export the container
module.exports = main;