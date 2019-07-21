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
            }
            callback(false);
        } else {
            //The user already exists
            callback(true);
        }
    });
}

//Init script
//Members Schema
var membersSchema = new Schema({
    discord: Number,
    mcName: String,
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

//Set up the models
var membersModel = mongoose.model('membersSchema', membersSchema);
var nationsModel = mongoose.model('nationsSchema', nationsSchema);

//Connect to the db
mongoose.connect(config["mongodb-url"]);
var db = mongoose.connection;

//Gets called when there is an error connecting to the db
db.on('error', function () {
    console.log('There was an error while connecting to the db');
});

//Gets called when the connection to the db succeeds
db.on('open', function () {
    console.log('Connection to db established');
});

//Export the container
module.exports = data;