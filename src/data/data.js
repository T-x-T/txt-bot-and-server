/*
*  EVERYTHING MEMBER DATA
*  Handles all the stuff with saving, loading, altering data in the db (basically just member stuff tho)
*/

//Dependencies
const config = require('../../config.js');
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
        birth_year: birthyear,
        country: nationality,
        publish_country: public
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
    data.checkMemberExist(filter, false, function (exists) {
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
    data.checkMemberExist(filter, false, function (exists) {
      if (exists) {
        //Get data from db if the user exists
        membersModel.findOne({ mcUUID: filter }, function (err, document) {
          if (document) {
            callback(false, document);
          } else {
            callback('Couldnt find the members document, but it should exist', false);
          }
        });
      } else {
        callback('User ' + filter + ' doesnt exist', false);
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
      data.getUserData(discord, function(err, userData){
        if(!err && userData.mcName > 2){
          mc_helpers.rcon('whitelist remove ' + userData.mcName);
        }
      })
      //User found, remove it
      membersModel.deleteOne({discord: discord}, function(err){
        if(err){
          callback(err);
        }else{
          callback(false);
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

//Get filtered user documents, if privacy is true, the output will reflect privacy settings; if onlyPaxterians is true, return only the data of accepted paxterya players
data.getMembers = function(filter, privacy, onlyPaxterians, callback){
  //This is important, so we can add more filters later on
  if(filter === false) filter = {};

  //If we should only return accepted paxterya players, insert the necessary check into the query
  if(onlyPaxterians) filter['status'] = 1;
  //Execute the query
  membersModel.find(filter, function(err, docs){
    if (!err && docs){
      if (privacy) {
        //Reflect privacy settings
        _internal.applyPrivacy(docs, function (newDocs) {
          callback(newDocs);
        });
      } else {
        //Send back everything
        callback(docs);
      }
    }else{
      callback(false);
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
data.addMcStats = function(uuid, stats, callback){
  //Craft the document
  var document = new mcStatsModel({
    timestamp: Date.now(),
    uuid: uuid,
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

//Returns the latest minecraft stats; if discord is a discord id, go by that, otherwise go by the uuid if its false get an array of all players
data.getNewestMcStats = function(uuid, callback){
  if(uuid){
    mcStatsModel.findOne({ uuid: uuid },{}, { sort: { 'timestamp' : -1 }}, function (err, document) {
      if (!err) {
        let stats = false;
        try{
          stats = document.stats.stats;
        }catch(e){}
        callback(stats);
      }else{
        callback(false);
      }
    });
  }else{
    //First get all unique discord ids
    mcStatsModel.find()
    .sort({timestamp: -1})
    .distinct('uuid')
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
};

data.getLastTimestampMcStats = function(uuid, callback){
  mcStatsModel.findOne({ uuid: uuid },{}, { sort: { 'timestamp' : -1 }}, function (err, document) {
    if (document) {
      callback(document.timestamp);
    } else {
      callback(0);
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
  status: {
    type: Number,
    default: 0
  }, //0 = regular pleb, 1 = whitelisted paxterya member
  birth_year: Number,
  birth_month: Number,
  country: String,
  publish_age: Boolean,
  publish_country: Boolean,
  karma: {
    type: Number,
    default: 0
  }
});

//mcStats Schema
var mcStatsSchema = new Schema({
  timestamp: Date,
  uuid: String,
  stats: Object
});

//Set up the models
var membersModel = mongoose.model('members', membersSchema);
var mcStatsModel = mongoose.model('mcStats', mcStatsSchema);

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

//Export the container
module.exports = data;
