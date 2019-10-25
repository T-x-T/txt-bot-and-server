/*
*  HANDLERS
*  Contains all functions which handle web requests
*/

//@TODO configure config path

//Dependencies
const config = require('./../config.js');
const fs = require('fs');
const path = require('path');
const webHelpers = require('./web-helpers.js');

//Create the container
var handlers = {};
handlers.paxapi = {};

//Not found handler
handlers.notFound = function (data, callback) {
  callback(404, 'The page you requested is not available', 'html');
};

//Handler for landing html sites
handlers.landing = function (data, callback){
  fs.readFile(path.join(__dirname, './html/' + data.path), 'utf8', function (err, fileData) {
    if (!err && fileData.length > 0) {
      webHelpers.insertVariables(data.path, fileData, function(err, newFileData){
        if(!err && fileData.length > 0){
          callback(200, newFileData, 'html');
        }else{
          callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
        }
      })
    } else {
      fs.readFile(path.join(__dirname, './html/' + data.path + '/index.html'), 'utf8', function (err, fileData) {
        if (!err && fileData.length > 0) {
          webHelpers.insertVariables(data.path + 'index.html', fileData, function(err, newFileData){
            if(!err && fileData.length > 0){
              callback(200, newFileData, 'html');
            }else{
              callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
            }
          })
        } else {
          //console.log(path.join(__dirname, './html/' + data.path));
          callback(404, 'html handler couldnt find the file', 'html');
        }
      });
    }
  });
};

//Handler for all paxterya html sites
handlers.paxterya = function (data, callback) {
  webHelpers.readHtmlAndEncapsulate(path.join(__dirname, './html/' + data.path), 'paxterya', function (err, fileData) {
    if (!err && fileData.length > 0) {
      webHelpers.insertVariables(data.path, fileData, function(err, newFileData){
        if(!err && fileData.length > 0){
          callback(200, newFileData, 'html');
        }else{
          callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
        }
      })
    } else {
      webHelpers.readHtmlAndEncapsulate(path.join(__dirname, './html/' + data.path + '/index.html'), 'paxterya', function (err, fileData) {
        if (!err && fileData.length > 0) {
          webHelpers.insertVariables(data.path + 'index.html', fileData, function(err, newFileData){
            if(!err && fileData.length > 0){
              callback(200, newFileData, 'html');
            }else{
              callback(500, 'Something bad happend. Not like a nuclear war, but still bad. Please contact TxT#0001 on Discord if you see this', 'html');
            }
          })
        } else {
          //console.log(path.join(__dirname, './html/' + data.path));
          callback(404, 'html handler couldnt find the file', 'html');
        }
      });
    }
  });
};

//Handlers for assets
handlers.assets = function (data, callback) {
  if (data.path.length > 0) {
    //Read in the asset
    fs.readFile(path.join(__dirname, './html/' + data.path), function (err, fileData) {
      //console.log(data.path);
      if (!err && fileData) {
        //Choose the contentType and default to plain
        var contentType = 'plain';
        if (data.path.indexOf('.css') > -1) contentType = 'css';
        if (data.path.indexOf('.png') > -1) contentType = 'png';
        if (data.path.indexOf('.jpg') > -1) contentType = 'jpg';
        if (data.path.indexOf('.ico') > -1) contentType = 'favicon';
        if (data.path.indexOf('.ttf') > -1) contentType = 'font';
        if (data.path.indexOf('.svg') > -1) contentType = 'svg';

        callback(200, fileData, contentType);
      } else {
        callback(404);
      }
    });
  }
};


/*
*
* paxapi stuff
*
*/

handlers.paxapi.application = {};

handlers.paxapi.application.post = function(data, callback){
  callback(200, '{}', 'json');
};

//Export the container
module.exports = handlers;
