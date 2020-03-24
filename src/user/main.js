/*
*  EVERYTHING MEMBER DATA
*  Handles all the stuff with saving, loading, altering data in the db (basically just member stuff tho)
*/

//Dependencies
const config = require('../../config.js');
const data = require('../data');
const mc = require('../minecraft/mc_helpers.js');
const discord = require('../discord_bot/discord_helpers.js');

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
  //Get all users
  user.get({}, false, function(err, docs){
    if(!err && docs){
      docs.forEach((doc) => {
        //Update discord nick
        discord.getNicknameByID(doc.discord, function(discord_nick){
          if(discord_nick) doc.discord_nick = discord_nick
          
          //Update Minecraft IGN if user has UUID
          if(doc.hasOwnProperty('uuid')){
            //Update Minecraft IGN as well
            mc.getIGN(doc.uuid, function(ign){
              if(ign) doc.ign = ign;
              user.edit(doc, false, function(err, doc){
                if(err) global.log(2, 'user.updateNick couldnt update user (with ign)', {err: err, doc: doc});
              });
            });
          }else{
            //User has no Minecraft UUID associated, edit directly
            user.edit(doc, false, function(err, doc){
              if(err) global.log(2, 'user.updateNick couldnt update user (without ign)', {err: err, doc: doc});
            });
          }
        });
      });
    }else{
      global.log(2, 'user.updateNicks cant get any users', {err: err});
    }
  });
};

//Internal functions
var _internal = {};

_internal.applyPrivacy = function (docs, callback){
  let newData = [];
  docs.forEach((cur) => {
    if (!cur.publish_age) {
      cur.birth_month = false;
      cur.birth_year = false;
    }
    if (!cur.publish_country) cur.country = false;

    newData.push(cur);
  });

  //Send back the cleaned array
  callback(newData);
};











const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Connect to the db
mongoose.connect(config["mongodb-url"], {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
var con = mongoose.connection;

//Gets called when there is an error connecting to the db
con.on('error', function() {
  console.log('Error connecting to database');
});

//Gets called when the connection to the db succeeds
con.on('open', function() {
  console.log('Sucessfully connected to database');
  db = con;
});

//mcStats Schema
var mcStatsSchema = new Schema({
  timestamp: Date,
  uuid: String,
  stats: Object
});

var mcStatsModel = mongoose.model('mcStats', mcStatsSchema);






//Inserts new a new stats object into mcStats
user.addMcStats = function(uuid, stats, callback) {
  //Craft the document
  var document = new mcStatsModel({
    timestamp: Date.now(),
    uuid: uuid,
    stats: stats
  });
  document.save(function(err, document) {
    if(!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

//Returns the latest minecraft stats; if discord is a discord id, go by that, otherwise go by the uuid if its false get an array of all players
user.getNewestMcStats = function(uuid, callback) {
  if(uuid) {
    mcStatsModel.findOne({uuid: uuid}, {}, {sort: {'timestamp': -1}}, function(err, document) {
      if(!err) {
        let stats = false;
        try {
          stats = document.stats.stats;
        } catch(e) {}
        callback(stats);
      } else {
        callback(false);
      }
    });
  } else {
    //First get all unique discord ids
    mcStatsModel.find()
      .sort({timestamp: -1})
      .distinct('uuid')
      .exec(function(err, ids) {
        if(!err) {
          //Now lets find all the newest stats from the array of discord ids
          let documents = [];
          ids.forEach((id) => {
            user.getNewestMcStats(id, function(doc) {
              if(doc) {
                documents.push(doc);

                //Check if this was the last operation, if yes, then return array of documents
                if(documents.length == ids.length) callback(documents);
              } else {
                callback(false);
              }
            });
          });
        } else {
          callback(false);
        }
      });
  }
};

user.getLastTimestampMcStats = function(uuid, callback) {
  mcStatsModel.findOne({uuid: uuid}, {}, {sort: {'timestamp': -1}}, function(err, document) {
    if(document) {
      callback(document.timestamp);
    } else {
      callback(0);
    }
  });
};






//Export the container
module.exports = user;
