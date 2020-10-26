/*
 *  WIDGETS
 *  This file contains all widgets 
 */

//Dependencies
const path = require('path');
const fs = require('fs');
const oauth = require('../auth');
const web_helpers = require('./web-helpers.js');

//Create the container
var widgets = {};

//Get widgets for given access_level
widgets.get = function(access_token, callback){
  //Get the access_level
  oauth.getAccessLevel({token: access_token}, false, function(err, access_level){
    if(access_level >= 3 && access_level <= 9){
      let html = '';
      widgets.list.forEach((widget) => {
        if(widget.level <= access_level) html += widget.html;
        html += '<br>'
      });
      web_helpers.insertVariables({path: 'widgets', access_token: access_token}, html, function(err, finishedHtml) {
        callback(finishedHtml);
      });
    }else{
      callback('There isnt anything to show here for some reason and that reason is probably that your session is too old. Please log in again!');
    }
  });
};

//Add all widgets metadata
widgets.init = function(){
  widgets.list = [
    {
      name: 'welcome',
      level: 3
    },
    {
      name: 'applications',
      level: 7
    }, 
    {
      name: 'posts',
      level: 9
    }];

  //Read in the html for the widgets and add that too
  fs.readFile(path.join(__dirname, '../../web/widgets/welcome.html'), function(err, fileData) {if(!err && fileData) widgets.list[0].html = fileData;});
  fs.readFile(path.join(__dirname, '../../web/widgets/applications.html'), function(err, fileData) {if(!err && fileData) widgets.list[1].html = fileData;});
  fs.readFile(path.join(__dirname, '../../web/widgets/posts.html'), function(err, fileData) {if(!err && fileData) widgets.list[2].html = fileData;});
};

//Export the container
module.exports = widgets;