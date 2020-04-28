/*
 *  in-memory testing data-backend
 *  stores data in memory and exposes extra functions for controlling the data, to facility better testing options
 */

//Dependencies

//Create the container for all the data
var data = {};

//Create the container
var main = {};

main.new = function(input, type, options, callback){
  if(data.hasOwnProperty(type)){
    input._id = Object.keys(data[type]).length;
    if(type == 'application' || type == 'post') input.id = input._id;
    data[type].push(input);
    callback(false, input);
  }else{
    data[type] = [];
    main.new(input, type, options, callback);
  }
};

main.edit = function(input, type, options, callback){
  let filter = false;
  filter = input.hasOwnProperty('_id') ? {_id: input._id} : filter;
  filter = input.hasOwnProperty('id') ? {id: input.id} : filter;
  filter = input.hasOwnProperty('discord') ? {discord: input.discord} : filter;
  filter = input.hasOwnProperty('discord_id') ? {discord_id: input.discord_id} : filter;

  if(filter){
     for(let i = 0; i < data[type].length; i++){
      if(data[type][i].hasOwnProperty('_id') && data[type][i]['_id'] == input['_id'] || 
        data[type][i].hasOwnProperty('id') && data[type][i]['id'] == input['id'] || 
        data[type][i].hasOwnProperty('discord') && data[type][i]['discord'] == input['discord'] || 
        data[type][i].hasOwnProperty('discord_id') && data[type][i]['discord_id'] == input['discord_id']){

          input._id = data[type][i]._id;
          data[type][i] = input;
          callback(false, input);
          break;
      }else{
      }
    }
  }else{
  }
};

main.get = function(filter, type, options, callback){
  if(!data.hasOwnProperty(type)) data[type] = [];
  if(Object.keys(filter).length === 0) filter = false;
  if(!filter){
    callback(false, data[type]);
  }else{
    let output = [];
    //Check if the filter uses an or
    if(filter.hasOwnProperty('$or')){
      //It uses an or
      let done = false
      data[type].forEach((doc) => {
        filter['$or'].forEach((_filter) => {
          for(let key in _filter) {
            if(doc.hasOwnProperty(key) && !done) {
              if(doc[key] === _filter[key]) {
                done = true;
                output.push(doc);
              }
            }
          }
        });
      });
    } else {
      //No or
      data[type].forEach((doc) => {
        for(let key in filter) {
          if(doc.hasOwnProperty(key)) {
            if(doc[key] === filter[key]) {
              output.push(doc);
            }
          }
        }
      });
    }
    callback(false, output);
  }
};

main.delete = function(filter, type, options, callback){
  if(!data.hasOwnProperty(type)) data[type] = [];
  if(Object.keys(filter).length === 0) filter = false;
  if(!filter) {
    data[type] = [];
    callback(false);
  } else {
    for(let i = 0; i < data[type].length; i++){
      for(let key in filter) {
        if(data[type][i].hasOwnProperty(key)) {
          if(data[type][i][key] === filter[key]) {
            data[type].splice(i, 1);
          }
        }
      }
    }
    callback(false);
  }
};

//Export the container
module.exports = main;