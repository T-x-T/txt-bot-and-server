/*
 *  INDEX FILE FOR USER COMPONENT
 *  Contains all functions that are to be called from other components, as well as emitter listeners
 */

//Dependencies
const config = require('../../config.js');
const main = require('./main.js');

//Create the container
var index = {};

//Gets user documents by filter
//Options:
//first = true: only returns first document (not as an array)
//privacy = true: the output will reflect privacy settings
//onlyPaxterians = true: return only the data of accepted paxterya players
index.get = function(filter, options, callback){
  main.get(filter, options, callback);
};

//Deletes documents based on filter
index.delete = function(filter, options, callback) {
  main.delete(filter, options, callback);
};

//Replaces the document that matches the input with the input
index.edit = function(input, options, callback) {
  main.edit(input, options, callback);
};

//Adds modifier to key of first documents matching filter 
index.modify = function(filter, key, modifier, options, callback){
  main.modify(filter, key, modifier, options, callback);
};

setTimeout(function(){
  emitter.on('user_left', (discord_id) => {
    main.delete({discord: discord_id}, false, function(err) {
      if(err) global.log(0, 'Couldnt delete user that left', {discord_id: discord_id});
    });
  });

  emitter.on('user_banned', (discord_id) => {
    main.delete({discord: discord_id}, false, function(err) {
      if(err) global.log(0, 'Couldnt delete user that got banned', {discord_id: discord_id});
    });
  });

  emitter.on('application_accepted_joined', (app) => {
    let input = {
      discord: app.discord_id,
      mcName: app.mc_ign,
      mcUUID: app.mc_uuid,
      birth_year: app.birth_year,
      birth_month: app.birth_month,
      country: app.country,
      publish_age: app.publish_age,
      publish_country: app.publish_country,
      status: 1
    };
    main.create(input, false, function(err, doc) {
      if(err) global.log(0, 'Couldnt create accepted user', {application: doc});
    });
  });
}, 1);

//Export the container
module.exports = index;