/*
 *  NEWS POST HANDLER
 *  This file contains functions for creating, retrieving, altering and deleting news posts from the database
 */

//Dependencies
const config = require('./../config.js');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create the container
var post = {};

//Connect to the db
mongoose.connect(config["mongodb-url"]);
var con = mongoose.connection;

//Gets called when there is an error connecting to the db
con.on('error', function() {
  console.log('Error connecting to database');
});

//Gets called when the connection to the db succeeds
con.on('open', function() {
  console.log('Post Sucessfully connected to database');
  db = con;
});

//This combines create and update, dynamically chooses the correct one
post.save = function(postData, callback) {
  postData.title = typeof postData.title == 'string' ? postData.title : false;
  postData.author = typeof postData.author == 'string' ? postData.author : false;
  postData.body = typeof postData.body == 'string' ? postData.body : false;
  postData.date = typeof postData.date == 'string' ? postData.date : new Date(Date.now()).toISOString().substring(0, 10);
  postData.public = typeof postData.public == 'boolean' ? postData.public : false;

  if(postData.title && postData.author && postData.body) {
    //Figure out if its a new post or not
    if(postData.id === 'false' || typeof postData.id == 'undefined'){
      //Its a new post
      post.create(postData, function(err){
        callback(err);
      });
    }else{
      //Edit the post
      post.update(postData, function(err){
        callback(err);
      });
    }
  } else {
    callback('One of the inputs is just plain wrong');
  }
};

//Creates a post
post.create = function(postData, callback) {
  let document = new postModel({
    title: postData.title,
    author: postData.author,
    body: postData.body,
    date: postData.date,
    public: postData.public
  });
  document.save(function(err, doc) {
    if(!err) {
      callback(false)
    } else {
      callback('Error saving to the database');
    }
  });
};

//Update a post
post.update = function(newPostData, callback) {
  if(typeof newPostData == 'object') {
    postModel.findOneAndUpdate({id: newPostData.id}, newPostData, function(err, doc) {
      if(!err) {
        callback(false);
      } else {
        callback(err);
      }
    });
  } else {
    callback('No Object received')
  }
}

//Retrieve posts (if no filter is given, return all)
post.get = function(filter, callback) {
  if(filter === false) filter = {};

  postModel.find(filter, function(err, docs) {
    if(!err && docs) {
      callback(docs);
    } else {
      callback(false);
    }
  });
};

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
  date: Date,
  public: Boolean
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

//Set up the model
var postModel = mongoose.model('posts', postSchema);

//Export the container
module.exports = post;