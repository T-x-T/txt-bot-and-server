/*
 *  MAIN FILE OF THE DISCORD_API COMPONENT
 *  The discord_api component contains functions to communicate with the discord api, outside of the scope from what discordjs provides and not including oauth
 */

//Dependencies
import https = require("https");
import Discord = require("discord.js");
import {IncomingMessage} from "node:http";

let client: Discord.Client;

global.g.emitter.once('discord_bot_ready', (_client: Discord.Client) => {
  client = _client;
});

const main = {
  //Get the user object from an access_token
  getUserObject(access_token: string, callback: Function) {
    //Get the users object
    https.get({
      host: 'discordapp.com',
      port: 443,
      path: '/api/users/@me',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bearer ' + access_token
      }
    }, function (res: IncomingMessage) {
      res.setEncoding('utf8');
      let userData = '';
      res.on('data', function (chunk) {
        userData += chunk;
      }).on('end', function () {
        let success = false;
        try {
          userData = JSON.parse(userData);
          success = true;
        } catch(e) {
          global.g.log(2, 'discord_api', 'oauth.getUserObject encountered an error', {err: e});
          callback(e, false);
        }
        if(success) callback(false, userData);
        else callback('Some error that shouldnt happen, well, happened', false)
      });
    });
  },

  getUserObjectById(id: string, options: {fromApi: boolean}, callback: Function) {
    //Check if this id is already cached
    if(global.g.cache.discordUserObjects.hasOwnProperty(id)) {
      //Its cached, return that
      callback(false, global.g.cache.discordUserObjects[id]);
    } else {
      if(options.fromApi) {
        //Ask the api anyways
        main.getUserObjectByIdFromApi(id, function (userData: IDiscordApiUserObject) {
          if(userData) {
            callback(false, userData);
          } else {
            callback('Couldnt get object from api', false);
          }
        });
      } else {
        //Its not cached, so we are probably still working on it (:
        callback('The username isnt cached yet', {username: 'load', discriminator: 'ing'})
      }
    }
  },

  //Get userObject by ID directly from api WITHOUT caching, NEVER EVER use this, unless you are 100% sure and asked TxT
  getUserObjectByIdFromApi(id: string, callback: Function) {
    //Get the users object
    https.get({
      host: 'discordapp.com',
      port: 443,
      path: '/api/users/' + id,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Bot ' + global.g.config.discord_bot.bot_token
      }
    }, function (res: IncomingMessage) {
      res.setEncoding('utf8');
      let userData: any = '';
      res.on('data', function (chunk) {
        userData += chunk;
      }).on('end', function () {
        let error = false
        try {
          userData = JSON.parse(userData);
        } catch(e) {
          global.g.log(2, 'discord_api', 'oauth.getUserObject encountered an error', {err: e});
          error = true;
        }
        if(!error) {
          //Check if we got rate-limited
          if(userData.hasOwnProperty("retry_after")) {
            //We got rate-limited, try again after it expired
            setTimeout(function () {
              main.getUserObjectById(id, null, function (_userData: IDiscordApiUserObject) {
                callback(_userData);
              });
            }, userData.retry_after + 10);

          } else {
            //No rate-limits
            global.g.cache.discordUserObjects[userData.id] = userData;
            callback(userData);
          }
        } else {
          callback(false);
        }
      });
    });
  },

  getNicknameByID(userID: string, callback: Function) {
    try {
      callback(`${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.discriminator}`);
    } catch(e) {
      global.g.log(0, 'discord_api', 'main.getNicknameByID encountered an error', {err: e, userID: userID});
      callback(false);
    }
  },

  //Callbacks the avatar url of the given userID
  getAvatarUrl(discord_id: string, callback: Function) {
    client.fetchUser(discord_id).then(myUser => {
      callback(myUser.avatarURL);
    }).catch(function () {callback(false)});
  },

  getMemberObjectByID(userID: string, callback: Function) {
    try {
      callback(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID));
    } catch(e) {
      callback(false);
    }
  }
}

export = main;