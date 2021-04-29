/*
 *  MAIN FILE OF THE DISCORD_API COMPONENT
 *  The discord_api component contains functions to communicate with the discord api, outside of the scope from what discordjs provides and not including oauth
 */

//Dependencies
import https = require("https");
import Discord = require("discord.js");
import {IncomingMessage} from "node:http";

let client: Discord.Client;

global.g.emitter.once("discord_bot_ready", (_client: Discord.Client) => {
  client = _client;
});

const main = {
  getUserObjectFromToken(access_token: string): Promise<IDiscordApiUserObject> {
    return new Promise((resolve, reject) => {
      https.get({
        host: "discordapp.com",
        port: 443,
        path: "/api/users/@me",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Bearer " + access_token
        }
      }, function (res: IncomingMessage) {
        res.setEncoding("utf8");
        let userData = "";
        res.on("data", function (chunk) {
          userData += chunk;
        }).on("end", function () {
          resolve(JSON.parse(userData));
        });
      });
    });
  },

  async getUserObjectFromId(id: string) {
    return client.fetchUser(id);
  },

  getNicknameByID(userID: string) {
    return `${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.username}#${client.guilds.get(global.g.config.discord_bot.guild).members.get(userID).user.discriminator}`;
  },

  async getAvatarUrl(discord_id: string) {
    return (await client.fetchUser(discord_id)).avatarURL;
  },

  getMemberObjectByID(userID: string) {
    return client.guilds.get(global.g.config.discord_bot.guild).members.get(userID);
  }
}

export = main;