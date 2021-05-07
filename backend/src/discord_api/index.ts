/*
 *  MAIN FILE OF THE DISCORD_API COMPONENT
 *  The discord_api component contains functions to communicate with the discord api, outside of the scope from what discordjs provides and not including oauth
 */

//Dependencies
import https = require("https");
import {IncomingMessage} from "node:http";

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
  }
}

export = main;