/*
 *  mongoDB data-backend
 *  Handles the communication with a mongoDB database
 */

//Dependencies
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Connect to the db
if(!typeof con === "undefined"){
  mongoose.connect(config.data.mongodb_url, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});
  con.on('error', function () {
    console.log('Error connecting to database');
  });

  con.on('open', function () {
    console.log('Sucessfully connected to database');
    db = con;
  });
}
con = typeof con !== "undefined" ? con : mongoose.connection;

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
  },
  read_cards: Array
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

var bulletinCardSchema = new Schema({
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0
  },
  deleted: {
    type: Boolean,
    default: false
  },
  owner: {
    type: String,
    required: true
  },
  category: {
    type: Number,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  expiry_date: Date,
  event_date: Date,
  location_x: Number,
  location_z: Number,
  item_names: Array,
  item_amounts: Array,
  price_names: Array,
  price_amounts: Array
});

var bulletinCategorySchema = new Schema({
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0
  },
  permission_level: {
    type: Number,
    default: 3
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  locked: {
    type: Boolean,
    default: false
  },
  enable_coordinates: Boolean,
  enable_trading: Boolean,
  enable_event: Boolean,
  discord_channel: String,
  discord_role: String,
  priority: Number,
  display_mode: String
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

//Code from stackoverflow to increment the counter id
bulletinCardSchema.pre('save', function(next) {
  // Only increment when the document is new
  if(this.isNew) {
    bulletinCardModel.count().then(res => {
      this.id = res; // Increment count
      next();
    });
  } else {
    next();
  }
});

//Code from stackoverflow to increment the counter id
bulletinCategorySchema.pre('save', function(next) {
  // Only increment when the document is new
  if(this.isNew) {
    bulletinCategoryModel.count().then(res => {
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
var applicationModel      = mongoose.model('applications', applicationSchema);
var bulletinModel         = mongoose.model('bulletin', bulletinSchema);
var userModel             = mongoose.model('members', userSchema);
var statsModel            = mongoose.model('mcstats', statsSchema);
var testModel             = mongoose.model('test', testSchema);
var postModel             = mongoose.model('posts', postSchema);
var logModel              = mongoose.model('log', logSchema);
var bulletinCardModel     = mongoose.model('bulletin_card', bulletinCardSchema);
var bulletinCategoryModel = mongoose.model('bulletin_category', bulletinCardSchema);

//Container for all database models
const models = {
  'application'      : applicationModel,
  'bulletin'         : bulletinModel,
  'user'             : userModel,
  'stats'            : statsModel,
  'test'             : testModel,
  'post'             : postModel,
  'log'              : logModel,
  'bulletin_card'    : bulletinCardModel,
  'bulletin_category': bulletinCategoryModel
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