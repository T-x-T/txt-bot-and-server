/*
 *  WEB HELPERS
 *  Contains various helper functions which are only necessary for the webserver
 */

//Dependencies
const config = require('./../config.js');
const fs = require('fs');
const _path = require('path');

//Create the container
var webHelpers = {};

//Reads in an html file and encapsulates it
webHelpers.readHtmlAndEncapsulate = function(path, site, callback){
  var headerPath = site === 'paxterya' ? _path.join(__dirname, './html/paxterya/header.html') : 'false';
  var footerPath = site === 'paxterya' ? _path.join(__dirname, './html/paxterya/footer.html') : 'false';
    fs.readFile(path, 'utf8', function(err, html){
      if(!err && html.length > 0){
        fs.readFile(headerPath, 'utf8', function(err, header){
          if(!err && header.length > 0){
            fs.readFile(footerPath, 'utf8', function(err, footer){
              if(!err && footer.length > 0){
                callback(false, header + html + footer);
              }else{
                callback(true, 'Couldnt open file');
              }
            })
          }else{
            callback(true, 'Couldnt open file');
          }
        })
      }else{
        callback(true, 'Couldnt open file');
      }
    })
};

//Export the container
module.exports = webHelpers;
