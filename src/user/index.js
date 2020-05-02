/*
 *  INDEX FILE FOR USER COMPONENT
 *  Contains all functions that are to be called from other components, as well as emitter listeners
 */

//Dependencies
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
  global.log(0, 'user', 'index.delete got called', {filter: filter, options: options});
  main.delete(filter, options, callback);
};

//Replaces the document that matches the input with the input
index.edit = function(input, options, callback) {
  global.log(0, 'user', 'index.edit got called', {input: input, options: options});
  main.edit(input, options, callback);
};

//Adds modifier to key of first documents matching filter 
index.modify = function(filter, key, modifier, options, callback){
  global.log(0, 'user', 'index.modify got called', {filter: filter, options: options, key: key, modifier: modifier});
  main.modify(filter, key, modifier, options, callback);
};

//Triggers the update of all IGNs and Nicks from all users
index.updateNicks = function(){
  main.updateNicks();
};

setImmediate(function(){
  emitter.on('user_left', (member, user) => {
    global.log(0, 'user', 'user_left, deletion triggered', { member: member, user: user });
    main.delete({ discord: user.discord }, false, function (err) {
      if (err) global.log(0, 'user', 'Couldnt delete user that left', { discord_id: user.discord });
    });
  });

  emitter.on('application_accepted_joined', (app) => {
    global.log(0, 'user', 'user component got event application_accepted_joined', {application: app});
    index.get({discord: app.discord_id}, {first: true}, function(err, doc){
      if(!err && doc){
        if(app.mcName) doc.mcName = app.mcName;
        doc.discord_nick = app.discord_nick; 
        doc.mcUUID = app.mc_uuid;
        doc.birth_year = app.birth_year;
        doc.birth_month = app.birth_month;
        doc.country = app.country;
        doc.publish_age = app.publish_age;
        doc.publish_country = app.publish_country;
        doc.status = 1;
        let newDoc = doc;
        index.edit(doc, false, function(err, doc){
          if(err || !doc) global.log(0, 'user', 'Failed modifying accepted user', {application: doc, err: err});
          index.get({discord: app.discord_id}, {first: true}, function(err, doc){
            if(doc.status != newDoc.status){
              index.edit(newDoc, false, function(err, doc){
                global.log(2, 'user', 'user application_accepted_joined had to try two times', {application: app, doc: doc, origDoc: doc});
              });
            }
          });
        });
      }else{
        if(err) global.log(0, 'user', 'Couldnt get accepted user', {application: doc, err: err});
      }
    });
  });
});

//Export the container
module.exports = index;