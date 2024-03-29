/*
 *  OAUTH2 WRAPPER
 *  This is the wrapper for oauth login
 */

//Dependencies
import qs = require("querystring");
import https = require("https");
import discord_api = require("../discord_api/index.js");
import Discord = require("discord.js");
import log = require("../log/index.js");
import {IncomingMessage} from "node:http";

let client: Discord.Client;
let config: IConfig;

const main = {
  init(_config: IConfig, _client: Discord.Client) {
    config = _config;
    client = _client;
  },

  getAccessLevelFromDiscordId(userID: string) {
    let access_level = 0;
    try {
      if(client.guilds.cache.get(config.discord_bot.guild).members.cache.get(userID).roles.cache.has(config.discord_bot.roles.paxterya)) access_level = 3;
      if(client.guilds.cache.get(config.discord_bot.guild).members.cache.get(userID).roles.cache.has(config.discord_bot.roles.cool)) access_level = 4;
      if(client.guilds.cache.get(config.discord_bot.guild).members.cache.get(userID).roles.cache.has(config.discord_bot.roles.mayor)) access_level = 5;
      if(client.guilds.cache.get(config.discord_bot.guild).members.cache.get(userID).roles.cache.has(config.discord_bot.roles.mod)) access_level = 7;
      if(client.guilds.cache.get(config.discord_bot.guild).members.cache.get(userID).roles.cache.has(config.discord_bot.roles.admin)) access_level = 8;
      if(client.guilds.cache.get(config.discord_bot.guild).members.cache.get(userID).roles.cache.has(config.discord_bot.roles.owner)) access_level = 9;
    } catch(e) {}
    log.write(0, "auth", "main.returnAcessLevel returned", {userID: userID, access_level: access_level});
    return access_level;
  },

  isGuildMember(userID: string) {
    return client.guilds.cache.get(config.discord_bot.guild).members.cache.has(userID);
  },

  async getAccessTokenAndLevelFromCode(code: string, redirect: string) {
    const accessToken = await main.getAccessTokenFromCode(code, redirect);
    const discordId = await main.getDiscordIdFromToken(accessToken);
    const accessLevel = main.getAccessLevelFromDiscordId(discordId);
    if(accessLevel) {
      return {accessToken: accessToken, accessLevel: accessLevel};
    } else {
      throw new Error("Couldnt get access_level");
    }
  },

  async getDiscordIdFromCode(code: string, redirect: string) {
    const access_token = await main.getAccessTokenFromCode(code, redirect) 
    if(access_token) {
      return await main.getDiscordIdFromToken(access_token);
    } else {
      throw new Error("Couldnt get access_token for code: " + code,);
    }
  },

  async getAccessLevelFromToken(access_token: string) {
    const discordId = await main.getDiscordIdFromToken(access_token)
    const access_level = main.getAccessLevelFromDiscordId(discordId);
    if(access_level) {
      return access_level;
    } else {
      throw new Error("Couldnt get access_level");
    }
  },

  async getDiscordIdFromToken(access_token: string) {
    return (await discord_api.getUserObjectFromToken(access_token)).id;
  },

  async getAccessLevelFromCode(code: string, redirect: string) {
    const discordId = await main.getDiscordIdFromCode(code, redirect)
    if(discordId) {
      return main.getAccessLevelFromDiscordId(discordId);
    } else {
      throw new Error("Couldnt get valid discord_id, this is what we got: " + discordId);
    }
  },

  //Takes a code and returns the access_token
  getAccessTokenFromCode(code: string, redirect: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let redirect_uri = "";
      redirect_uri = redirect == "application" ? config.auth.discord_redirect_uri_application : redirect_uri;
      redirect_uri = redirect == "staffLogin" ? config.auth.discord_redirect_uri_staffLogin : redirect_uri;
      redirect_uri = redirect == "applicationNew" ? config.auth.discord_redirect_uri_applicationNew : redirect_uri;
      redirect_uri = redirect == "interface" ? config.auth.discord_redirect_uri_interface : redirect_uri;

      const payload = qs.stringify({
        client_id: config.auth.discord_client_id,
        client_secret: config.auth.discord_client_secret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
        scope: "identify"
      });
      
      const req = https.request({
        host: "discordapp.com",
        port: 443,
        path: "/api/oauth2/token",
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }, function (res: IncomingMessage) {
        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", function (chunk) {
          rawData += chunk;
        }).on("end", function () {
          const data = JSON.parse(rawData);
          const access_token = typeof data.access_token == "string" ? data.access_token : false;
          if(access_token) {
            resolve(access_token);
          } else {
            reject("Access_token looks weird: " + access_token);
          }
        });
        req.on("error", (e) => {
          log.write(2, "auth", "oauth.getAccess_token encountered an error", {err: e});
          reject(e);
        });
      });

      req.write(payload);
      req.end();
    });
  }
}

export = main;