/*
 *  in-memory testing data-backend
 *  stores data in memory and exposes extra functions for controlling the data, to facility better testing options
 */

//Dependencies
const config = require('../../config.js');

//Create the container for all the data
var data = {};

//Create the container
var main = {};

main.new = function(input, type, options, callback){
  if(data.hasOwnProperty(type)){
    input._id = Object.keys(data[type]).length + 1;
    if(type == 'application') input.id = input._id;
    data[type].push(input);
    callback(false, input)
    emitter.emit('data_testing_new', input, type, options);
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
      for(let key in filter) {
        if(data[type][i].hasOwnProperty(key)) {
          if(data[type][i][key] === filter[key]) {
            data[type][i] = input;
            callback(false, input);
          }
        }
      }
    }
  }else{
    callback('No valid input', false)
  }
};

main.get = function(filter, type, options, callback){
  if(!data.hasOwnProperty(type)) data[type] = [];
  if(filter === {}) filter = false;
  if(!filter){
    callback(false, data[type]);
  }else{
    let output = [];
    if(filter.hasOwnProperty('$or')){
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
    //console.log({filter: filter, output: output, data: data[type]})
    callback(false, output);
  }
};

main.delete = function(filter, type, options, callback){
  data[type] = [];
  callback(false)
};

//Export the container
module.exports = main;