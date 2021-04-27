/*
 *  MINECRAFT HELPERS
 *  Contains various helper functions for different Minecraft related operations
 */

//Dependencies
import https = require("https");
import {IncomingMessage} from "node:http";

export = {
  //Takes an IGN and returns the UUID
  getUUID(ign: string, callback: Function) {
    //Make the web request
    https.get({
      host: 'api.mojang.com',
      port: 443,
      path: `/users/profiles/minecraft/${encodeURIComponent(ign)}?at=${Date.now()}`
    }, function (res: IncomingMessage) {
      res.setEncoding('utf8');
      let data: any = '';
      res.on('data', function (chunk) {
        data += chunk;
      }).on('end', function () {
        //Do something with the data the webrequest returned
        //Try to parse the data
        try {
          data = JSON.parse(data);
        } catch(e) {
          global.g.log(2, 'minecraft', 'mc_helpers.getUUID couldnt pare the JSON returned from Mojangs API', {error: e, data: data, ign: ign});
        }
        global.g.log(0, 'minecraft', 'getUUID received valid data', {ign: ign, data: data});
        //Check if the returned data makes sense
        if(data.hasOwnProperty('id')) {
          if(data.id.length == 32) {
            //Returned object is valid
            callback(false, data.id);
          } else {
            callback('Data from API doesnt contain valid id. ' + data, false);
          }
        } else {
          //Data isnt valid
          callback('Data from API doesnt contain id. ' + data, false);
        }
      });
    });
  },

  //Takes an UUID and returns the current IGN
  getIGN(uuid: string, callback: Function) {
    https.get({
      host: 'api.mojang.com',
      port: 443,
      path: `/user/profiles/${uuid}/names`
    }, function (res: IncomingMessage) {
      res.setEncoding('utf8');
      let data: any = '';
      res.on('data', function (chunk) {
        data += chunk;
      }).on('end', function () {
        //Do something with the data the webrequest returned
        //Try to parse the data
        let dataOK;
        try {
          data = JSON.parse(data);
          dataOK = true;
        } catch(e) {
          global.g.log(2, 'minecraft', 'mc_helpers.getIGN couldnt pare the JSON returned from Mojangs API', {error: e, data: data, uuid: uuid});
          dataOK = false;
        }
        if(typeof data != 'object' || typeof data == 'undefined') dataOK = false;
        if(dataOK) {
          global.g.log(0, 'minecraft', 'getIGN received valid data', {uuid: uuid, data: data});
          //Only save the latest entry
          data = data[data.length - 1];
          //Check if the returned data makes sense
          if(typeof data !== 'undefined') {
            if(data.hasOwnProperty('name')) {
              //Returned object is valid
              callback(false, data.name);
            } else {
              //Data isnt valid
              callback('Data from API doesnt contain valid ign: ' + data, false);
            }
          } else {
            callback('Data from API is undefined', false);
          }
        } else {
          callback('data isnt valid: ' + data, false);
        }
      });
    });
  },

  returnRenderUrl(uuid: string) {
    return `https://crafatar.com/renders/body/${uuid}?overlay=true`;
  }
}