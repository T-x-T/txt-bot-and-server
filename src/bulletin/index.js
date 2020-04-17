/*
 *  INTERFACE FOR THE BULLETIN COMPONENT
 *  Contains all functions that are to be called from external sources
 */

//Dependencies
const main = require('./main.js');
const sanitize = require('sanitize-html');
const auth = require('../auth');

//Create the container
var index = {};

//Save a entry item (calls new or edit)
index.save = function(input, options, callback){
  input.message = typeof input.message == 'string' && input.message.length > 0 && input.message.length <= 1000 ? input.message : false;
  if(input.message) {
    //Sanitize message
    input.message = sanitize(input.message, {allowedTags: [], allowedAttributes: {}});
    input.message = input.message.replace(/\r?\n|\r/g, " ");
    input.message = input.message.replace(/@/g, "");
    input.message = input.message.replace(/&amp;/g, "&");
    input.message = input.message.trim();

    //Check if its a new entry
    if(!input.hasOwnProperty('_id')) {
      //Create
      main.create(input, function(err, doc) {
        if(!err && doc) {
          callback(false, doc);
        } else {
          callback(err, false);
        }
      });
    } else {
      //Update
      //Get the current version of the bulletin to be edited to find out the author
      index.get({_id: input._id}, {first: true}, function(err, doc) {
        if(!err && typeof doc !== 'undefined'){
          if(input.editAuthor === doc.author) {
            //new author same as old one
            main.update(input, callback);
          } else {
            //Check if new author is admin
            if(auth.getAccessLevel({id: input.editAuthor}, false) >= 9) {
              //New author is admin
              main.update(input, callback);
            } else {
              //New author is no admin
              callback('You are not authorized to edit this bulletin', input);
            }
          }
        }else{
          callback(err);
        }
      });
    }
  } else {
    callback('There is a problem with your message', input);
  }
};

//Retrieve one or multiple entries 
//Options:
//first: only return the first object of the result
index.get = function(filter, options, callback) {
  main.get(filter, function(err, docs){
    if(options.first){
      callback(err, docs[0])
    }else{
      callback(err, docs);
    }
  });
};

//Delete all entries matching the filter
index.delete = function(input, options, callback) {
  //Get the current version of the bulletin to be deleted to find out the author
  index.get({_id: input._id}, {first: true}, function(err, doc) {
    if(!err && typeof doc !== 'undefined') {
      if(input.deleteAuthor === doc.author) {
        //new author same as old one
        main.delete({_id: input._id}, callback);
      } else {
        //Check if new author is admin
        if(auth.getAccessLevel({id: input.deleteAuthor}, false) >= 9) {
          //New author is admin
          main.delete({_id: input._id}, callback);
        } else {
          //New author is no admin
          callback('You are not authorized to delete this bulletin', input);
        }
      }
    }else{
      callback(err);
    }
  });
};

//Export the container
module.exports = index;