/*
 *  MAIN FILE OF THE DISCORD_API COMPONENT
 *  The discord_api component contains functions to communicate with the discord api, outside of the scope from what discordjs provides and not including oauth
 */

//Dependencies
const config = require('../../config.js');
const https = require('https');

//Create the container
var main = {};

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
        global.log(2, 'oauth.getUserObject encountered an error', {err: e});
        callback(e, false);
      }
      if(success) callback(false, userData);
      else callback('Some error that shouldnt happen, well, happened', false)
    });
  });
};

main.getUserObjectById = function(id, callback) {
  //Check if this id is already cached
  if(global.cache.discordUserObjects.hasOwnProperty(id)) {
    //Its cached, return that
    callback(false, global.cache.discordUserObjects[id]);
  } else {
    //Its not cached, so we are probably still working on it (:
    callback('The username isnt cached yet', {username: 'load', discriminator: 'ing'})
  }
};

main.updateUserIdCache = function() {
  //Needs to be imported here, otherwise data hasnt initialized or something like that
  const user = require('../user');
  const application = require('../application');

  //Get all discord Ids
  user.get({}, false, function(err, docs) {
    //Get all applications as well
    application.get({}, false, function(err, applications){
      docs = Object.assign(docs, applications);
    });

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
      'Authorization': 'Bot ' + config['bot-token']
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
        global.log(2, 'oauth.getUserObject encountered an error', {err: e});
        error = true;
      }
      if(!error) {
        //Check if we got rate-limited
        if(userData.hasOwnProperty("retry_after")) {
          //We got rate-limited, try again after it expired
          setTimeout(function() {
            main.getUserObjectById(id, function(_userData) {
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

//Export the container
module.exports = main;