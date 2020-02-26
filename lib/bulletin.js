/*
 *  BULLETIN
 *  This file handles everything in regards to the bulletin board
 */

//Dependencies
const config = require('./../config.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create the container
var bulletin = {};

//Connect to the db
mongoose.connect(config["mongodb-url"]);
var con = mongoose.connection;

//Gets called when there is an error connecting to the db
con.on('error', function() {
  console.log('Error connecting to database');
});

//Gets called when the connection to the db succeeds
con.on('open', function() {
  console.log('Bulletin Sucessfully connected to database');
  db = con;
});

//Combines create and update, chooses whatever makes sense based on if the input has an _id associated
//This also validates input 
//CB: Error, new entry
bulletin.save = function(input, callback){
  input.message = typeof input.message == 'string' && input.message.length > 0 ? input.message : false;
  if(input.message){
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
  let document = new bulletinModel({
    author: input.author,
    message: input.message,
    date: Date.now()
  });
  document.save(function(err, doc){
    if(!err && doc){
      callback(false, doc);
    }else{
      callback('Error saving new entry in the database', false);
    }
  });
};

//Update an entry in the database; CB: Error, new entry
bulletin.update = function(input, callback){
  if(typeof input === 'object'){
    bulletinModel.findOneAndUpdate({_id: input._id}, input, function(err, doc){
      if(!err && doc){
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
  bulletinModel.find(filter, function(err, docs){
    if(!err && docs){
      callback(false, docs);
    }else{
      callback('No entries received from the database', false);
    }
  });
};

//Removes entries from the database based on a filter, if no filter is given, no entries are removed; CB: Error
bulletin.remove = function(filter, callback){
  if(typeof filter === 'object'){
    bulletinModel.findByIdAndRemove(filter, function(err){
      if(!err){
        callback(false);
      }else{
        callback('Error removing entries from database');
      }
    })
  }else{
    callback('Cant remove entries, no filter given');
  }
};

var bulletinSchema = new Schema({
  author: String, //discord_id
  message: String,
  date: Date,
});

var bulletinModel = mongoose.model('bulletin', bulletinSchema);

//Export the container
module.exports = bulletin;