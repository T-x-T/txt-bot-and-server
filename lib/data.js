/*
 *  EVERYTHING DATA
 *  Handles all the stuff with saving, loading, altering data in the db
 */

//Dependencies
const config = require('./../config.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const log = require('./log.js');

var db;
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

//Retrieves all user data (identified by their discord user ID)
data.getUserData = function(discord, callback){
  //Check if the user already exists
  data.checkMemberExist(discord, true, function (exists) {
      if (exists) {
          //Get karma from db if the user exists
          membersModel.findOne({ discord: discord }, function (err, document) {
              if (document) {
                  callback(false, document);
              } else {
                  callback('Couldnt find the members document, but it should exist', false);
              }
          })
      } else {
          callback('User didnt exist, but creating failed with some error', false);
      }
  });
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
            log.write(2, 'data.updateUserData couldnt Update user data ', {err: err}, function(e){});
            callback(true)
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
          log.write(2, 'data.removeMember couldnt delete member from database', {err: err, discord: discord}, function(error){});
          callback(false);
        }
      })
    }else{
      log.write(0, 'data.removeMember couldnt find the member', {discord: discord}, function(error){});
      callback('Couldnt find the user');
    }
  });
}

//Get all members
data.listAllMembers = function (callback) {
    membersModel.find(function(err, data){
        if (data) {
            callback(data);
        } else {
            callback({});
        }

    });
}

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
                        log.write(2, 'data.updateKarma couldnt Update user data ', err, function(e){});
                        callback(true);
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
          log.write(2, 'data.addMcStats couldnt save stats to db', {err: err, data: document}, function(e){});
          callback(err);
      }
  });
};

data.getNewestMcStats = function(discord, callback){
  mcStatsModel.findOne({ discord: discord },{}, { sort: { 'timestamp' : -1 }}, function (err, document) {
      if (document) {
          callback(document.stats.stats);
      } else {
          callback(false);
      }
  });
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
