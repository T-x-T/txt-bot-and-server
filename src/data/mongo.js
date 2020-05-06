/*
 *  mongoDB data-backend
 *  Handles the communication with a mongoDB database
 */

//Dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Connect to the db
mongoose.connect(config.data.mongodb_url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
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

//Create the container
const main = {};

//Stores a new entry
main.new = function(input, type, options, callback) {
  //Get our current model
  let model = models[type];
  let document = new model(input);
  document.save(function(err, doc){
    if(!err && doc){
      callback(false, doc._doc);
    }else{
      callback(err, false);
    }
  });
};

//Edits one existing entry
main.edit = function(input, type, options, callback) {
  let filter = false;
  filter = input.hasOwnProperty('_id') ? {_id: input._id} : filter;
  filter = input.hasOwnProperty('discord') ? {discord: input.discord} : filter;
  filter = input.hasOwnProperty('discord_id') ? {discord_id: input.discord_id} : filter;
  filter = input.hasOwnProperty('id') ? {id : input.id} : filter;
  
  if(filter){
    //Get our current model
    let model = models[type];

    //Delete _id field
    delete input._id;

    model.findOneAndUpdate(filter, input, {new: true, useFindAndModify: false, upsert: true}, function(err, doc){
      if(!err && doc){
        callback(false, doc._doc);
      }else{
        callback(err, false);
      }
    });
  }else{
    callback('Couldnt find the object to modify in the database', false);
  }
};

//Gets multiple existing entries
main.get = function(filter, type, options, callback) {
  //Get our current model
  let model = models[type];
  let _options = options.hasOwnProperty('sort') ? {sort: options.sort} : {};
  if(!options.max_results){
    //Find multiple elements
    model.find(filter, null, _options, function(err, docs){
      if(!err && docs) {
        let output = [];
        docs.forEach((doc) => {
          output.push(doc._doc);
        });
        callback(false, output);
      }else{
        callback(err, false);
      }
    });
  }else{
    //Find only single document
    model.findOne(filter, null, _options, function(err, doc){
      if(!err && doc) {
        let output = [];
        output.push(doc._doc);
        callback(false, output);
      }else{
        if(err === null) err = false;
        callback(err, false);
      }
    });
  }
};

//Deletes one existing entry
main.delete = function(filter, type, options, callback) {
  //Get our current model
  let model = models[type];
  model.deleteMany(filter, function(err){
    if(!err){
      callback(false);
    }else{
      callback(err);
    }
  });
};

//Set up the schemas
var applicationSchema = new Schema({
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0
  },
  timestamp: Date,
  mc_uuid: String,
  discord_id: String,
  email_address: String,
  country: String,
  birth_month: Number,
  birth_year: Number,
  about_me: String,
  motivation: String,
  build_images: String,
  publish_about_me: Boolean,
  publish_age: Boolean,
  publish_country: Boolean,
  discord_nick: String,
  mc_ign: String,
  status: {
    type: Number,
    default: 1         //1 = pending review; 2 = denied; 3 = accepted
  },
  deny_reason: String,
  testing: {
    type: Boolean,
    default: false
  }
});

var bulletinSchema = new Schema({
  author: String, //discord_id
  message: String,
  date: Date,
});

var userSchema = new Schema({
  discord: {
    type: String,
    index: true,
    unique: true
  },
  discord_nick: String,
  mcName: String,
  mcUUID: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 0
  }, //0 = regular pleb, 1 = whitelisted paxterya member, 2 = inactive paxterya member
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

var statsSchema = new Schema({
  timestamp: Date,
  sub_type: String,
  uuid: String,
  stats: Object
});

var postSchema = new Schema({
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0
  },
  title: String,
  author: String,
  body: String,
  date: String,
  public: Boolean
});

var logSchema = new Schema({
  timestamp: {
    type: Date,
    default: Date.now()
  },
  level: Number, //0 = debug, 1 = info, 2 = warn, 3 = error
  component: String,
  name: String,
  data: Object
});

//Code from stackoverflow to increment the counter id
postSchema.pre('save', function(next) {
  // Only increment when the document is new
  if(this.isNew) {
    postModel.count().then(res => {
      this.id = res; // Increment count
      next();
    });
  } else {
    next();
  }
});

//Code from stackoverflow to increment the counter id
applicationSchema.pre('save', function(next) {
  // Only increment when the document is new
  if(this.isNew) {
    applicationModel.count().then(res => {
      this.id = res; // Increment count
      next();
    });
  } else {
    next();
  }
});

//test Schema
var testSchema = new Schema({
  id: Number,
  text: String
});

//Set up the models
var applicationModel = mongoose.model('applications', applicationSchema);
var bulletinModel    = mongoose.model('bulletin', bulletinSchema);
var userModel        = mongoose.model('members', userSchema);
var statsModel       = mongoose.model('mcstats', statsSchema);
var testModel        = mongoose.model('test', testSchema);
var postModel        = mongoose.model('posts', postSchema);
var logModel         = mongoose.model('log', logSchema);

//Container for all database models
const models = {
  'application': applicationModel,
  'bulletin': bulletinModel,
  'user': userModel,
  'stats': statsModel,
  'test': testModel,
  'post': postModel,
  'log': logModel
};

/*
 *  DB Upgrades/Migrations
 *
 */

//Converts all old style mcstats objects to new style
if(config.data.db_upgrades.mc_stats_sub_type){
  main.get({}, 'stats', false, function(err, docs) {
    docs.forEach((doc) => {
      doc.sub_type = 'mc_stats'
      main.edit(doc, 'stats', false, function(err, doc) {
        if(err) console.log(err)
      })
    });
  });
}

//Export the container
module.exports = main;