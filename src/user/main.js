/*
*  EVERYTHING MEMBER DATA
*  Handles all the stuff with saving, loading, altering data in the db (basically just member stuff tho)
*/

//Dependencies
const data = require('../data');
const discord = require('../discord_api');

//Create the container
var user = {};

//Creates a new member in the database
user.create = function (input, options, callback) {
  data.new(input, 'user', false, function(err, doc){
    if(!err && doc){
      callback(false, doc);
    }else{
      callback(err, false);
    }
  });
};

//Get filtered user documents
user.get = function(filter, options, callback){
  //This is important, so we can add more filters later on
  if(filter === false) filter = {};

  //If we should only return accepted paxterya players, insert the necessary check into the query
  if(options.onlyPaxterians) filter['status'] = 1;
  //Apply options.first
  let first = options.hasOwnProperty('first') ? options.first : false;
  //Execute the query
  data.get(filter, 'user', {first: first}, function(err, docs){
    //Check if the user doesnt exist
    if(first === true && docs == false || filter.hasOwnProperty('discord') && docs.length === 0){
      //A specific user got queried, and it doesnt exist => create it
      user.create({discord: filter.discord}, false, function(err, doc){
        if(err){
          callback('User doesnt exist and couldnt get created: ' + err, false);
        }else{
          data.get(filter, 'user', options, callback)
        }
      });
    }else{
      if(!err) {
        if(options.privacy) {
          _internal.applyPrivacy(docs, function(newDocs) {
            callback(false, newDocs);
          });
        } else {
          callback(false, docs);
        }
      } else {
        callback(err, false);
      }
    }
  });
};

//Deletes a user permanently from the database
user.delete = function(filter, options, callback) {
  data.delete(filter, 'user', false, function(err){
    if(err){
      callback(err);
    }else{
      callback(false);
    }
  });
};

//Updates data from an existing user
user.edit = function(input, options, callback) {
  data.edit(input, 'user', false, function(err, doc){
    if(!err && doc){
      callback(false, doc);
    }else{
      callback(err, false);
    }
  });  
};

//Adds modifier to key of first documents matching filter
user.modify = function(filter, key, modifier, options, callback) {
  user.get(filter, {first: true}, function(err, doc){
    if(!err && doc){
      if(!doc.hasOwnProperty(key) || isNaN(doc[key])) doc[key] = 0;
      doc[key] += modifier;
      user.edit(doc, false, function(err, doc){
        if(!err && doc){
          callback(false, doc);
        }else{
          callback(err, false);
        }
      });
    }else{
      callback('Couldnt find user: ' + err, false);
    }
  });
};

//Triggers the update of all IGNs and Nicks from all users
user.updateNicks = function(){
  const mc = require('../minecraft');
  //Get all users
  user.get({}, false, function(err, docs){
    if(!err && docs){
      docs.forEach((doc) => {
        //Update discord nick
        discord.getNicknameByID(doc.discord, function (discord_nick) {
          if(discord_nick){
            doc.discord_nick = discord_nick;
            user.edit(doc, false, function(err, doc) {
              if(err) global.log(2, 'user.updateNick couldnt update user', {err: err, doc: doc});
            });
          } 
        });
      });
      //Trigger update of minecraft igns
      mc.updateAllIGNs();
    }else{
      global.log(2, 'user.updateNicks cant get any users', {err: err});
    }
  });
};

//Internal functions
var _internal = {};

_internal.applyPrivacy = function (docs, callback){
  if(docs){
    if(Array.isArray(docs)){
      let newData = [];
      docs.forEach((cur) => {
        if(!cur.publish_age) {
          cur.birth_month = false;
          cur.birth_year = false;
        }
        if(!cur.publish_country) cur.country = false;

        newData.push(cur);
      });

      //Send back the cleaned array
      callback(newData);
    }else{
      if(!docs.publish_age) {
        docs.birth_month = false;
        docs.birth_year = false;
      }
      if(!docs.publish_country) docs.country = false;

      callback(docs)
    }
  }else{
    callback(false);
  }
};

//Export the container
module.exports = user;
