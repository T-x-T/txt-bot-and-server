/*
 *  BULLETIN
 *  This file handles everything in regards to the bulletin board
 */

//Dependencies
const user = require('../user');
const data = require('../data');
const sanitize = require('sanitize-html');
const auth = require('../auth');

//Create the container
var bulletin = {};

//Create a new entry in the database; CB: Error, new entry
bulletin.create = function(input, callback){
  //First get all bulletins from the author. to check if they already have the max count
  bulletin.getCards({owner: input.owner}, false, function(err, docs){
    if(docs.length < config.bulletin.max_per_usr || auth.getAccessLevel({id: input.owner}, false, false) >= 7){
      //Check if the owner has the permission to post in the category
      bulletin.getCategories({ id: input.category }, { first: true }, function (err, category) {
        if (category) {
          if (category.permission_level <= auth.getAccessLevel({ id: input.owner }, false, false)) {
            //Everything ok
            let document = {
              owner: input.owner,
              category: input.category,
              message: input.message,
              date: Date.now(),
              expiry_date: input.expiry_date ? input.expiry_date : null,
              event_date: input.event_date ? input.event_date : null,
              location_x: input.location_x,
              location_z: input.location_z,
              item_names: input.item_names,
              item_amounts: input.item_amounts,
              price_names: input.price_names,
              price_amounts: input.price_amounts
            };
            data.new(document, 'bulletin_card', false, function (err, doc) {
              if (!err && doc) {
                //Also send message in discord
                emitter.emit('bulletin_new', document);

                callback(false, doc);
              } else {
                global.log(0, 'bulletin', 'Error saving new entry in the database', { input: input, document: document, err: err, doc: doc });
                callback('Error saving new entry in the database', false);
              }
            });
          }else{
            callback('You dont have permission to post here', false);
          }
        }else{
          callback('Invalid category, or it was not found', false);
        }
      });
    }else{
      //This author has too many messages already
      callback('You already have five bulletins, please delete an existing one to be able to add more!', false);
    }
  });
};

//Update an entry in the database; CB: Error, new entry
bulletin.update = function(input, callback){
  if(typeof input === 'object'){
    let updateDoc = {
      id: input.id,
      message: input.message,
      expiry_date: input.expiry_date ? input.expiry_date : null,
      event_date: input.event_date ? input.event_date : null,
      location_x: input.location_x ? input.location_x : null,
      location_z: input.location_z ? input.location_z : null,
      item_names: input.item_names && input.item_names.length > 0 ? input.item_names : null,
      item_amounts: input.item_amounts && input.item_amounts.length > 0 ? input.item_amounts : null,
      price_names: input.price_names && input.price_names.length > 0 ? input.price_names : null,
      price_amounts: input.price_amounts && input.price_amounts.length > 0 ? input.price_amounts : null
    };

    data.edit(updateDoc, 'bulletin_card', false, function(err, doc){
      if(!err && doc){
        //Emit appropriate event
        emitter.emit('bulletin_edit', doc);
        callback(false, doc);
      }else{
        global.log(0, 'bulletin', 'error updating bulletinCard in database', {input: input, err: err, doc: doc, updateDoc: updateDoc});
        callback('Error updating entry in database', false);
      }
    });
  }else{
    callback('No object provided', false);
  }
};

//Removes entries from the database based on a filter, if no filter is given, no entries are removed; CB: Error
bulletin.delete = function(input, callback){
  if(typeof input === 'object'){
    data.edit({id: input.id, deleted: input.deleted}, 'bulletin_card', false, function(err){
      if(!err){
        emitter.emit('bulletin_deleted');
        callback(false);
      }else{
        callback('Error updating entry in database');
      }
    });
  }else{
    callback('Cant remove entry, no filter given');
  }
};

bulletin.getCards = function(filter, options, callback){
  data.get({$and: [filter, {deleted: false}]}, 'bulletin_card', options, function(err, docs){
    if(!err){

      //Do some stuff to mark these cards read when they are already read, and then mark all read for next time
      if(options.requester){
        user.get({discord: options.requester}, {first: true}, function(err, requester){
          if(!err){
            //Add read state to all cards that requester got served already
            if (Array.isArray(requester.read_cards)) requester.read_cards.forEach((read_id) => {
              docs.forEach((card) => {
                if(card.id == read_id) card.read = true;
              });
            });

            //Add all cards to read state of requester
            if (!Array.isArray(requester.read_cards)) requester.read_cards = [];
            docs.forEach((card) => { if(!(requester.read_cards.indexOf(card.id) > -1)) requester.read_cards.push(card.id); });
            
            user.edit(requester, false, function(err, doc){});
          }
        });
      }

      //Do some magic and call docs back
      if(options.include_author && docs.length > 0){
        for(let i = 0; i < docs.length; i++){
          user.get({discord: docs[i].owner}, {first: true}, function(err, doc){
            if(!err && doc){
              docs[i].author = doc.mcName;
            }
            if(i == docs.length - 1){
              callback(false, docs);
            }
          });
        }
      }else{
        callback(false, docs);
      }
    }else{
      global.log(0, 'bulletin', 'main.getCards encountered an error', {filter: filter, options: options, err: err, docs: docs});
      callback('Error retrieving documents from database: ' + err, docs);
    }
  });
};

bulletin.getCategories = function(filter, options, callback){
  data.get(filter, 'bulletin_category', options, function(err, docs){
    if(!err){
      callback(false, docs);
    }else{
      global.log(0, 'bulletin', 'main.getCards encountered an error', {filter: filter, options: options, err: err, docs: docs});
      callback('Error retrieving documents from database: ' + err, docs);
    }
  });
};

bulletin.sanitize = function(input, callback){
  //Check and sanitize standard properties
  if(typeof input.message !== 'string' || input.message.length > 1000 || input.message.length < 2){
    callback('The message doesnt make any kind of sense');
    return;
  }
  input.message = sanitize(input.message, {allowedTags: [], allowedAttributes: {}});
  input.message = input.message.replace(/\n{2,}/g, " ");
  input.message = input.message.replace(/@/g, "");
  input.message = input.message.replace(/&amp;/g, "&");
  input.message = input.message.trim();

  input.expiry_date = input.expiry_date && new Date(input.expiry_date) > new Date() ? input.expiry_date : false;

  //Get category data
  bulletin.getCategories({id: input.category}, {first: true}, function(err, category){
    if(err || !category){
      callback('The category doesnt seem to exist');
      return;
    }
  
    //Check and sanitize coordinates if neccessary
    if(category.enable_coordinates && input.location_x && input.location_z){
      input.location_x = Math.trunc(input.location_x);
      input.location_z = Math.trunc(input.location_z);
    }

    //Check and sanitize trades if neccessary
    if(category.enable_trading){
      if(!Array.isArray(input.item_names) || !Array.isArray(input.item_amounts) || !Array.isArray(input.price_names) || !Array.isArray(input.price_amounts)){
        callback('You are missing valid trading data');
        return;
      }
      if(input.item_names.length === 0 || input.item_amounts.length === 0 || input.price_names.length === 0 || input.price_amounts.length === 0){
        callback('At least one of your trades doesnt contain an item, price or the amount for one of the them');
        return;
      }
      if(input.item_names.length === input.item_amounts.length === input.price_names.length === input.price_amounts.length){
        callback('Not all arrays are the same length, you probably missed one field');
        return;
      }

      for(let i = 0; i < input.item_names.length; i++){
        input.item_names[i] = sanitize(input.item_names[i], { allowedTags: [], allowedAttributes: {} });
        if(input.item_names[i].length > 32){
          callback('item names are only allowed to be 32 characters long');
          return;
        }
      } 
      for(let i = 0; i < input.price_names.length; i++){
        input.price_names[i] = sanitize(input.price_names[i], { allowedTags: [], allowedAttributes: {} });
        if (input.price_names[i].length > 32) {
          callback('price names are only allowed to be 32 characters long');
          return;
        }
      } 
    }

    //Check and sanitize event if neccessary
    if(category.enable_event){
      if(!input.event_date || new Date(input.event_date) < new Date()){
        callback('No event date specified');
        return;
      }
    }

    callback(false, input);
  });
};

//Export the container
module.exports = bulletin;