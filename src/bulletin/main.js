/*
 *  BULLETIN
 *  This file handles everything in regards to the bulletin board
 */

//Dependencies
const user = require('../user');
const data = require('../data');

//Create the container
var bulletin = {};

//Create a new entry in the database; CB: Error, new entry
bulletin.create = function(input, callback){
  //First get all bulletins from the author. to check if they already have 5
  bulletin.get({author: input.author}, function(err, docs){
    if(docs.length < config.bulletin.max_per_usr){
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
        //Emit appropriate event
        let message = `<@${input.author}> edited a bulletin:\n${input.message}`;    //DONT DO THAT HERE
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
        user.get({discord: docs[i].author}, {privacy: true, onlyPaxterians: true, first: true}, function(err, memberData){
          let newDoc = {};
          newDoc._id = docs[i]._id;
          newDoc.author = docs[i].author;
          newDoc.message = docs[i].message;
          newDoc.date = docs[i].date;
          newDoc.author_name = memberData.mcName;
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