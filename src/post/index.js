/*
 *  INDEX FILE FOR POST COMPONENT
 *  Continas all functions of the post component that are to be called from the outside world
 */

//Dependencies
const main = require('./main.js');

//Create the container
var index = {};

//Saves one new or existing post
index.save = function(input, options, callback){
  main.save(input, options, callback);
};

//Retrieves posts
//Options:
//first = true: return the first post as an object; last = true: return the last post as an object
index.get = function(filter, options, callback){
  main.get(filter, options, function(err, docs){
    if(!err){
      //Implements option first
      if(options.first && docs.length > 0) docs = docs[0];

      //Implements option last
      if(options.last && docs.length > 0) docs = docs[docs.length - 1];

      callback(false, docs);
    }else{
      callback(err, false);
    }
  });
};

//Export the container
module.exports = index;