/*
 *  INDEX FILE FOR DISCORD_API COMPONENT
 *  This file contains all functions that are to be called from other components
 */

//Dependencies
import main = require("./main.js");

export = {
  //Returns a userObject from discords api
  //Input is an object with the type as a key
  //Allowed types are: id, token
  getUserObject(input: any, options: any, callback: Function) { //TODO: replace with promise based functions
    global.g.log(0, 'discord_api', 'index.getUserObject got called', {input: input, options: options});
    if(input.hasOwnProperty('id')) {
      main.getUserObjectById(input.id, options, callback);
    } else if(input.hasOwnProperty('token')) {
      main.getUserObject(input.token, callback);
    } else {
      callback('No valid input received, input: ' + input, false);
    }
  },

  //Calls back the guildMember Object using the discord bot
  getMemberObjectByID(discord_id: string, callback: Function) {
    main.getMemberObjectByID(discord_id, callback);
  },

  //only works for guildMembers
  getNicknameByID(userID: string, callback: Function) {
    global.g.log(0, 'discord_api', 'index.getNicknameByID', {userID: userID});
    main.getNicknameByID(userID, callback);
  },

  getAvatarUrl(discord_id: string, callback: Function) {
    main.getAvatarUrl(discord_id, callback);
  },

  getUserObjectByIdFromApi: main.getUserObjectByIdFromApi
}