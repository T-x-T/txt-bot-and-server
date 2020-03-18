/*
 *  BULLETIN
 *  This file handles everything in regards to the bulletin board
 */

//Dependencies
const config = require('../../config.js');
const sanitize = require('sanitize-html');
const user = require('../user/data.js');
const discord_helpers = require('../discord_bot/discord_helpers.js');
const data = require('../data');

//Create the container
var bulletin = {};

//Combines create and update, chooses whatever makes sense based on if the input has an _id associated
//This also validates input 
//CB: Error, new entry
bulletin.save = function(input, callback){
  input.message = typeof input.message == 'string' && input.message.length > 0  && input.message.length <= 1000 ? input.message : false;
  if(input.message){
    //Sanitize message
    input.message = sanitize(input.message, {allowedTags: [], allowedAttributes: {}});
    input.message = input.message.replace(/\r?\n|\r/g, " ");
    input.message = input.message.replace(/@/g, "");
    input.message = input.message.replace(/&amp;/g, "&");
    input.message = input.message.trim();

    //Check if its a new entry
    if(!input.hasOwnProperty('_id')){
      //Create
      bulletin.create(input, function(err, doc){
        if(!err && doc){
          callback(false, doc);
        }else{
          callback(err, false);
        }
      });
    }else{
      //Update
      bulletin.update(input, function(err, doc) {
        if(!err && doc) {
          callback(false, doc);
        } else {
          callback(err, false);
        }
      });
    }
  }else{
    callback('There is a problem with your message');
  }
};

//Create a new entry in the database; CB: Error, new entry
bulletin.create = function(input, callback){
  //First get all bulletins from the author. to check if they already have 5
  bulletin.get({author: input.author}, function(err, docs){
    if(docs.length == 0 || docs.length < 5){
      //Everything ok
      let document = {
        author: input.author,
        message: input.message,
        date: Date.now()
      };
      data.new(document, 'bulletin', false, function(err, doc) {
        if(!err && doc) {
          //Also send message in discord
          let message = `<@${input.author}> posted a new bulletin:\n${input.message}`;
          emitter.emit('bulletin_new', message);

          callback(false, doc);
        } else {
          callback('Error saving new entry in the database', false);
        }
      });
    }else{
      //This author has too many messages already
      callback('You already have five bulletins, please delete an existing one to be able to add more!', false);
    }
  });
};

//Update an entry in the database; CB: Error, new entry
bulletin.update = function(input, callback){
  if(typeof input === 'object'){
    data.edit(input, 'bulletin', false, function(err, doc){
      if(!err && doc){
        //Also send message in discord
        let message = `<@${input.author}> edited a bulletin:\n${input.message}`;
        emitter.emit('bulletin_edit', message);
        callback(false, doc);
      }else{
        callback('Error updating entry in database', false);
      }
    });
  }else{
    callback('No object provided', false);
  }
};

//Gets entries from the database matching the filter, if no filter is given return all; CB: Error, array of results
bulletin.get = function(filter, callback){
  if(typeof filter !== 'object') filter = {};
  data.get(filter, 'bulletin', false, function(err, docs){
    if(!err && docs.length > 0){
      //Fill in the authors name
      let newDocs = [];
      for(let i = 0; i < docs.length; i++){
        user.getMembers({discord: docs[i].author}, true, true, function(memberData){
          let newDoc = {};
          newDoc._id = docs[i]._id;
          newDoc.author = docs[i].author;
          newDoc.message = docs[i].message;
          newDoc.date = docs[i].date;
          newDoc.author_name = memberData[0].mcName;
          newDocs.push(newDoc);
          //Check if this is the last callback, if so, callback
          if(newDocs.length === docs.length){
            //Sort after date
            newDocs.sort(function(a, b) {
              return new Date(b.date) - new Date(a.date);
            });

            callback(false, newDocs);
          }
        });
      };
    }else{
      callback('No entries received from the database', []);
    }
  });
};

//Removes entries from the database based on a filter, if no filter is given, no entries are removed; CB: Error
bulletin.delete = function(filter, callback){
  if(typeof filter === 'object'){
    data.delete(filter, 'bulletin', false, function(err){
      if(!err){
        emitter.emit('bulletin_deleted');
        callback(false);
      }else{
        callback('Error removing entries from database');
      }
    });
  }else{
    callback('Cant remove entries, no filter given');
  }
};

//Export the container
module.exports = bulletin;