/*
 *  INDEX FILE FOR THE AUTH COMPONENT
 *  This file contains all functions that are to be called from other components
 */

//Dependencies
import main = require("./main.js");

export = {
  //Gets the discord_id from an input
  //input is an object containing one key for the type of input and the value
  //Valid types are: code, token
  getDiscordId(input: any, options: any, callback: Function) { //TODO: fix any
    global.g.log(0, 'auth', 'index.getDiscordId got called', {input: input, options: options});
    if(input.hasOwnProperty('code')) {
      main.getDiscordIdFromCode(input.code, options.redirect, callback);
    } else if(input.hasOwnProperty('token')) {
      main.getDiscordIdFromToken(input.token, callback);
    } else {
      callback('No valid input received, input: ' + input, false);
    }
  },

  //Gets the access_level from an input
  //input is an object containing one key for the type of input and the value
  //Valid types are: code, token, id
  getAccessLevel(input: any, options: any, callback?: Function) { //TODO: fix any
    global.g.log(0, 'auth', 'index.getAccessLevel got called', {input: input, options: options});
    if(input.hasOwnProperty('code')) {
      main.getCodeAccessLevel(input.code, options.redirect, callback);
    } else if(input.hasOwnProperty('token')) {
      main.getTokenAccessLevel(input.token, callback);
    } else if(input.hasOwnProperty('id')) {
      if(typeof callback == 'function') callback(main.returnAccessLevel(input.id));
      else return main.returnAccessLevel(input.id);
    } else {
      if(callback) callback('No valid input received, input: ' + input, false);
    }
    return null;
  },

  isGuildMember: main.isGuildMember
}