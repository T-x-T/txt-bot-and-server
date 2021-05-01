/*
 *  MINECRAFT HELPERS
 *  Contains various helper functions for different Minecraft related operations
 */

//Dependencies
import https = require("https");
import {IncomingMessage} from "node:http";

export = {
  getUUID(ign: string): Promise<string> {
    return new Promise((resolve, reject) =>{
      https.get({
        host: "api.mojang.com",
        port: 443,
        path: `/users/profiles/minecraft/${encodeURIComponent(ign)}?at=${Date.now()}`
      }, function (res: IncomingMessage) {
        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", function (chunk) {
          rawData += chunk;
        }).on("end", function () {
          const data = JSON.parse(rawData);
          if(data.hasOwnProperty('id') && data.id.length == 32){
            resolve(data.id);
          } else {
            reject("Data from API doesnt contain valid id. " + rawData);
          }
        });
      });
    });
  },

  getIGN(uuid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if(!uuid) reject("given uuid is falsy");
      https.get({
        host: "api.mojang.com",
        port: 443,
        path: `/user/profiles/${uuid}/names`
      }, function (res: IncomingMessage) {
        res.setEncoding("utf8");
        let rawData = "";
        res.on("data", function (chunk) {
          rawData += chunk;
        }).on("end", function () {
          let data = JSON.parse(rawData);
          //Only keep the latest entry
          data = data[data.length - 1];
          
          if(data?.hasOwnProperty("name")) {
            resolve(data.name);
          } else {
            reject("Data from API doesnt contain valid ign: " + rawData);
          }
        });
      });
    });
  },

  getRenderUrl(uuid: string) {
    return `https://crafatar.com/renders/body/${uuid}?overlay=true`;
  }
}