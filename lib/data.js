/*
*  EVERYTHING DATA
*  Handles all the stuff with saving, loading, altering data in the db
*/

//Dependencies
const config = require('./../config.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create the container
var data = {};

data.getDB = function (callback) {
  //Connect to the db
  mongoose.connect(config["mongodb-url"]);
  var con = mongoose.connection;

  //Gets called when there is an error connecting to the db
  con.on('error', function () {
    callback(true, false);
  });

  //Gets called when the connection to the db succeeds
  con.on('open', function () {
    callback(false, con);
  });
};

//Creates a new member in the database
data.createMember = function (discord, mcName, birthyear, nationality, public, callback) {
  //Check if the user already exists
  data.checkMemberExist(discord, false, function (exists) {
    if (!exists) {
      var document = new membersModel({
        discord: discord,
        mcName: mcName,
        birthyear: birthyear,
        nationality: nationality,
        public: public
      });
      document.save(function (err, document) {
        if (!err) {
          callback(false);
        } else {
          callback(err);
        }
      });
    } else {
      callback('The specified user already exists');
    }
  });
};

//Retrieves all user data (identified by their discord user ID or their uuid)
data.getUserData = function(filter, callback){
  if(filter.length == 18){
    //its a discord id
    //Check if the user already exists
    data.checkMemberExist(filter, true, function (exists) {
      if (exists) {
        //Get data from db if the user exists
        membersModel.findOne({ discord: filter }, function (err, document) {
          if (document) {
            callback(false, document);
          } else {
            callback('Couldnt find the members document, but it should exist', false);
          }
        });
      } else {
        callback('User didnt exist, but creating failed with some error', false);
      }
    });
  }else{
    //Lets assume its a uuid
    //Check if the user already exists
    data.checkMemberExist(filter, true, function (exists) {
      if (exists) {
        //Get data from db if the user exists
        membersModel.findOne({ discord: filter }, function (err, document) {
          if (document) {
            callback(false, document);
          } else {
            callback('Couldnt find the members document, but it should exist', false);
          }
        });
      } else {
        callback('User didnt exist, but creating failed with some error', false);
      }
    });
  }
};

//Updates data from an existing user
//Usage: First use data.getUserData, then modify it and then store the changes by calling this function here
data.updateUserData = function(discord, newUserData, callback){
  if(typeof newUserData == 'object'){
    data.checkMemberExist(discord, false, function(exists){
      if(exists){
        //Everything seems to be fine, lets update the User
        membersModel.findOneAndUpdate({discord: discord}, newUserData, function(err){
          if(!err){
            callback(false)
          }else{
            callback('Couldnt update user data');
          }
        });
      }else{
        callback('The user doesnt exist, please create User first');
      }
    });
  }else{
    callback('Please provide the complete User Document');
  }
};

//Removes a user permanently from the database
data.removeMember = function(discord, callback){
  data.checkMemberExist(discord, false, function(exists){
    if(exists){
      //User found, remove it
      membersModel.deleteOne({discord: discord}, function(err){
        if(err){
          callback(err);
        }else{
          callback('couldnt delete member from database');
        }
      })
    }else{
      callback('Couldnt find the user');
    }
  });
};

//Get all members
data.listAllMembers = function (callback) {
  membersModel.find(function(err, data){
    if (data) {
      callback(data);
    } else {
      callback({});
    }
  });
};

//Get karma of member
data.getKarma = function (discord, callback) {
  //Check if the user already exists
  data.checkMemberExist(discord, true, function (exists) {
    if (exists) {
      //Get karma from db if the user exists
      membersModel.findOne({ discord: discord }, function (err, document) {
        if (document) {
          callback(false, document.karma);
        } else {
          callback('Couldnt find the members document, but it should exist', false);
        }
      })
    } else {
      callback('User didnt exist, but creating failed with some error', false);
    }
  });
};

//Updates karma of given member by the given amount
data.updateKarma = function (discord, karma, callback) {
  //Check if the user already exists
  data.checkMemberExist(discord, true, function (exists) {
    if (exists) {
      data.getKarma(discord, function (err, curKarma) {
        if(typeof(curKarma) == 'number') {
          karma += curKarma;
        }else{
          callback('Getting karma form user failed');
        }
        membersModel.findOneAndUpdate({ discord: discord }, { karma: karma }, function (err) {
          if (!err) {
            callback(false);
          } else {
            callback('couldnt Update user data');
          }
        });
      });
    } else {
      callback('User didnt exist, but creating failed as well');
    }
  });
};

//Checks if a specified member exists in the database and creates member if not
data.checkMemberExist = function (discord, createMemberIfDoesntExist, callback) {
  membersModel.findOne({ discord: discord }, function (err, document) {
    if (!document) {
      //The user doesnt exist yet
      if (createMemberIfDoesntExist) {
        //We need to create the user because it doesnt exist and this var is true
        data.createMember(discord, null, null, null, false, function (err) {
          if (!err) {
            callback(true);
          } else {
            callback(false);
          }
        });
      } else {
        callback(false);
      }
    } else {
      //The user already exists
      callback(true);
    }
  });
};

//Inserts new a new stats object into mcStats
data.addMcStats = function(discord, stats, callback){
  //Craft the document
  var document = new mcStatsModel({
    timestamp: Date.now(),
    discord: discord,
    stats: stats
  });
  document.save(function (err, document) {
    if (!err) {
      callback(false);
    } else {
      callback(err);
    }
  });
};

//Returns the latest minecraft stats; if discord is a discord id, go by that, otherwise go by the uuidm if its false get an array of all players
data.getNewestMcStats = function(filter, callback){
  if(filter.length == 18){
    mcStatsModel.findOne({ discord: filter },{}, { sort: { 'timestamp' : -1 }}, function (err, document) {
      if (!err) {
        callback(document.stats.stats);
      } else {
        callback(false);
      }
    });
  }else{
    if(filter){
      mcStatsModel.findOne({ mcUUID: filter },{}, { sort: { 'timestamp' : -1 }}, function (err, document) {
        if (!err && document != null) {
          callback(document.stats.stats);
        } else {
          callback(false);
        }
      });
    }else{
      //First get all unique discord ids
      mcStatsModel.find()
      .sort({timestamp: -1})
      .distinct('discord')
      .exec(function(err, ids){
        if(!err){
          //Now lets find all the newest stats from the array of discord ids
          let documents = [];
          ids.forEach((id) => {
            data.getNewestMcStats(id, function(doc){
              if(doc){
                documents.push(doc);

                //Check if this was the last operation, if yes, then return array of documents
                if(documents.length == ids.length) callback(documents);
              }else{
                callback(false);
              }
            });
          });
        }else{
          callback(false);
        }
      });
    }
  }
};

data.getLastTimestampMcStats = function(discord, callback){
  mcStatsModel.findOne({ discord: discord },{}, { sort: { 'timestamp' : -1 }}, function (err, document) {
    if (document) {
      callback(document.timestamp);
    } else {
      callback(false);
    }
  });
};

//Init script
//Members Schema
var membersSchema = new Schema({
  discord: String,
  mcName: String,
  mcUUID: {
    type: String,
    default: null
  },
  birthyear: Number,
  nationality: Number,
  public: Boolean,
  karma: {
    type: Number,
    default: 0
  }
});

//Nations Schema
var nationsSchema = new Schema({
  nationID: Number,
  name: String,
  shortName: String
});

//mcStats Schema
var mcStatsSchema = new Schema({
  timestamp: Date,
  discord: String,
  stats: Object
});

//Set up the models
var membersModel = mongoose.model('members', membersSchema);
var nationsModel = mongoose.model('nations', nationsSchema);
var mcStatsModel = mongoose.model('mcStats', mcStatsSchema);

//Export the container
module.exports = data;
