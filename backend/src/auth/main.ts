/*
 *  OAUTH2 WRAPPER
 *  This is the wrapper for oauth login
 */

//Dependencies
import qs = require("querystring");
import https = require("https");
import discord_api = require("../discord_api/index.js");
import Discord = require("discord.js");
import {IncomingMessage} from "node:http";

var client: Discord.Client;

global.g.emitter.once('discord_bot_ready', (_client: Discord.Client) => {
  client = _client;
});

const main = {
  returnAccessLevel(userID: string) {
    let access_level = 0;
    try {
      if(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).roles.has(global.g.config.discord_bot.roles.paxterya)) access_level = 3;
      if(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).roles.has(global.g.config.discord_bot.roles.cool)) access_level = 4;
      if(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).roles.has(global.g.config.discord_bot.roles.utp)) access_level = 5;
      if(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).roles.has(global.g.config.discord_bot.roles.mod)) access_level = 7;
      if(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).roles.has(global.g.config.discord_bot.roles.admin)) access_level = 8;
      if(client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).roles.has(global.g.config.discord_bot.roles.owner)) access_level = 9;
    } catch(e) {}
    global.g.log(0, 'auth', 'main.returnAcessLevel returned', {userID: userID, access_level: access_level});
    return access_level;
  },

  //Returns true if the given discord id is member of the guild and false if not
  isGuildMember(userID: string) {
    let is = client.guilds.get(global.g.config.discord_bot.guild).members.has(userID);
    global.g.log(0, 'auth', 'main.isGuildMember returned', {userID: userID, isGuildMember: is});
    return is
  },

  //Takes a code and returns the discord_id
  getDiscordIdFromCode(code: string, redirect: string, callback: Function) {
    main.getAccess_token(code, redirect, function (_err: Error, access_token: string) {
      if(access_token) {
        main.getDiscordIdFromToken(access_token, callback);
      } else {
        callback('Couldnt get access_token for code: ' + code, false);
      }
    });
  },

  //Calls back true if the given access_token belongs to an admin
  getTokenAccessLevel(access_token: string, callback: Function) {
    main.getDiscordIdFromToken(access_token, function (_err: Error, discord_id: string) {
      let access_level = main.returnAccessLevel(discord_id);
      if(access_level) {
        callback(false, access_level);
      } else {
        callback('Couldnt get access_level', false);
      }
    });
  },

  //Takes an access_token and returns the discord_id
  getDiscordIdFromToken(access_token: string, callback: Function) {
    discord_api.getUserObject({token: access_token}, false, function (_err: Error, userObject: IDiscordApiUserObject) {
      if(userObject.hasOwnProperty('id')) {
        callback(false, userObject.id, access_token); //The access_token is only needed by oauth.isCodeAdmin
      } else {
        callback('Couldnt get valid userObject, this is what we got: ' + userObject, false);
      }
    });
  },

  getCodeAccessLevel(code: string, redirect: string, callback: Function) {
    main.getDiscordIdFromCode(code, redirect, function (_err: Error, discord_id: string, access_token: string) {
      if(discord_id) {
        callback(false, main.returnAccessLevel(discord_id), access_token); //handlers.paxLogin sets the access_token as a cookie
      } else {
        callback('Couldnt get valid discord_id, this is what we got: ' + discord_id, false);
      }
    });
  },

  //Takes a code and returns the access_token
  getAccess_token(code: string, redirect: string, callback: Function) {
    let redirect_uri = '';
    redirect_uri = redirect == 'application' ? global.g.config.auth.discord_redirect_uri_application : redirect_uri;
    redirect_uri = redirect == 'staffLogin' ? global.g.config.auth.discord_redirect_uri_staffLogin : redirect_uri;
    redirect_uri = redirect == 'applicationNew' ? global.g.config.auth.discord_redirect_uri_applicationNew : redirect_uri;
    redirect_uri = redirect == 'interface' ? global.g.config.auth.discord_redirect_uri_interface : redirect_uri;
    
    //Now lets get the access_token from that code
    let payload = qs.stringify({
      'client_id': global.g.config.auth.discord_client_id,
      'client_secret': global.g.config.auth.discord_client_secret,
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }, function (res: IncomingMessage) {
      res.setEncoding('utf8');
      let data: any = '';
      res.on('data', function (chunk) {
        data += chunk;
      }).on('end', function () {
        try {
          data = JSON.parse(data);
        } catch(e) {
          callback(e, false);
        }
        let access_token = typeof data.access_token == 'string' ? data.access_token : false;
        if(access_token) {
          callback(false, access_token);
        } else {
          callback('Access_token looks weird: ' + access_token, false);
        }
      });
      req.on('error', (e) => {
        global.g.log(2, 'auth', 'oauth.getAccess_token encountered an error', {err: e});
        callback(e, false);
      });
    });

    req.write(payload);
    req.end();
  }
}

export = main;