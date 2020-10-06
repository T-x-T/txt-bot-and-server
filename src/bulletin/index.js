/*
 *  INTERFACE FOR THE BULLETIN COMPONENT
 *  Contains all functions that are to be called from external sources
 */

//Dependencies
const main = require('./main.js');
const auth = require('../auth');
const MemberFactory = require('../user/memberFactory.js');
const memberFactory = new MemberFactory();
memberFactory.connect();

//Create the container
var index = {};

//Save a entry item (calls new or edit)
index.save = function(input, options, callback){
  main.sanitize(input, function(err, output){
    if(err){
      callback(err, false);
      return;
    }
    input = output;

    //Check if its a new entry
    if(!input.hasOwnProperty('id')) {
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
      index.getCards({id: input.id}, {first: true}, function(err, doc) {
        if(!err && typeof doc !== 'undefined'){
          if(input.editAuthor === doc.author) {
            //new author same as old one
            main.update(input, callback);
          } else {
            //Check if new author is mod
            if(auth.getAccessLevel({id: input.editAuthor}, false) >= 7) {
              //New author is mod
              main.update(input, callback);
            } else {
              //New author is not mod
              callback('You are not authorized to edit this bulletin', input);
            }
          }
        }else{
          callback(err);
        }
      });
    }
  });
};

//retrieve one or multiple bulletin cards
//Options: like data.get
index.getCards = function(filter, options, callback){
  main.getCards(filter, options, callback);
};

//retrieve one or multiple bulletin categories
//Options: like data.get
index.getCategories = function(filter, options, callback){
  main.getCategories(filter, options, callback);
};

//Returns an object with all cards and categories
index.getAll = function(discordID, callback){
  index.getCards(false, false, function(err1, docs1){
    index.getCategories(false, false, function(err2, docs2){
      if(!err1 && !err2){
        if(discordID){
          memberFactory.getByDiscordId(discordID)
          .then(member => {
            callback(false, {
              cards: docs1,
              categories: docs2,
              read_states: member.read_cards
            });
          })
          .catch(e => {
            callback('Coulnt get the user object: ' + e, false);
          });
        }else{
          callback(false, {
            cards: docs1,
            categories: docs2
          });
        }
      }else{
        callback('Couldnt get cards or categories: ' + err1 + err2, false);
      }
    });
  });
};

//Delete all entries matching the filter
index.delete = function(input, options, callback) {
  //Get the current version of the bulletin to be deleted to find out the owner
  index.getCards({id: input.id}, {first: true}, function(err, doc) {
    if(!err && typeof doc !== 'undefined') {
      if(input.deleteAuthor === doc.owner) {
        //new author same as old one
        main.delete(input, callback);
      } else {
        //Check if new author is mod
        if(auth.getAccessLevel({id: input.deleteAuthor}, false) >= 7) {
          //New author is mod
          main.delete(input, callback);
        } else {
          //New author is no mod
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