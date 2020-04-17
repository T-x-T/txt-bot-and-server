/*
 *  NEWS POST HANDLER
 *  This file contains functions for creating, retrieving, altering and deleting news posts from the database
 */

//Dependencies
const data   = require('../data');

//Create the container
var post = {};

//This combines create and update, dynamically chooses the correct one
post.save = function(postData, options, callback) {
  postData.title = typeof postData.title == 'string' ? postData.title : false;
  postData.author = typeof postData.author == 'string' ? postData.author : false;
  postData.body = typeof postData.body == 'string' ? postData.body : false;
  postData.date = typeof postData.date == 'string' ? postData.date : new Date(Date.now()) //.toISOString().substring(0, 10);
  postData.public = typeof postData.public == 'boolean' ? postData.public : false;

  if(postData.title && postData.author && postData.body) {
    //Figure out if its a new post or not
    if(postData.id === 'false' || typeof postData.id == 'undefined'){
      //Its a new post
      post.create(postData, function(err){
        callback(err, postData);
      });
    }else{
      //Edit the post
      post.update(postData, function(err){
        callback(err, postData);
      });
    }
  } else {
    callback('One of the inputs is just plain wrong');
  }
};

//Creates a post
post.create = function(postData, callback) {
  let document = {
    title: postData.title,
    author: postData.author,
    body: postData.body,
    date: postData.date,
    public: postData.public
  };
  data.new(document, 'post', false, function(err, doc){
    if(!err) {
      callback(false, doc)
    } else {
      callback('Error saving to the database: ' + err, false);
    }
  });
};

//Update a post
post.update = function(newPostData, callback) {
  if(typeof newPostData == 'object') {
    data.edit(newPostData, 'post', false, function(err, doc){
      if(!err) {
        callback(false, doc);
      } else {
        callback('Error editing the post: ' + err, false);
      }
    });
  } else {
    callback('No Object received')
  }
};

//Retrieve posts (if no filter is given, return all)
post.get = function(filter, options, callback) {
  if(filter === false) filter = {};
  data.get(filter, 'post', false, function(err, docs){
    if(!err) {
      callback(false, docs);
    } else {
      callback('Error retrieving documents from database: ' + err, false);
    }
  });
};

//Export the container
module.exports = post;