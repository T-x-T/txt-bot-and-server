/*
*  INDEX FOR WEBSERVER
*  contains all setup and routing for web requests
*/

//Dependencies
const config = require('./../config.js');
const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const url = require('url');
const handlers = require('./handlers');
const log = require('./../lib/log.js');

//Create the container
var server = {};

//Instanciate the http server
server.httpServer = http.createServer(function (req, res) {
  server.getDataObject(req, function(data){
    res.writeHead(301, {Location: `https://${data.headers.host}/${data.path}`});
      res.end();
  });
});

//https stuff
if(config['use-external-certs']){
  server.httpsConfig = {
    'key': fs.readFileSync(path.join(config['cert-path'], 'privkey.pem')),
    'cert': fs.readFileSync(path.join(config['cert-path'], 'fullchain.pem'))
  };
}else{
  server.httpsConfig = {
    'key': fs.readFileSync(path.join(__dirname, './certs/localhost.key')),
    'cert': fs.readFileSync(path.join(__dirname, './certs/localhost.crt'))
  };
}

//Instanciate the https server
server.httpsServer = https.createServer(server.httpsConfig, function (req, res) {
  //Form the data object
  server.getDataObject(req, function(data){
    //Log the request
    log.write(0, 'Web Request received', {data: data, sourceIP: req.connection.remoteAddress});



    //FOR TESTING ONLY
    let origHost = data.headers.host;
    data.headers.host = 'thetxt.club'
    data.headers.host = 'paxterya.com'

    if(data.headers.hasOwnProperty('landingtesting')) data.headers.host = 'thetxt.club';
    //Insert the correct path for different hosts
    if(!data.path.startsWith('assets')){
      if (data.headers.host.indexOf('thetxt.club') > -1) data.path = '/landing/' + data.path;
      if (data.headers.host.indexOf('paxterya.com') > -1) data.path = '/paxterya/' + data.path;
    }

    //necessary for testing purposes
    data.headers.host = origHost;

    console.log(data.method, data.path)
    if(data.method == 'post') console.log(data.payload);

    //Check the path and choose a handler
    var chosenHandler = handlers.html;
    chosenHandler = data.path.indexOf('assets') > -1 ? handlers.assets : chosenHandler;
    chosenHandler = data.path.startsWith('/landing') ? handlers.landing : chosenHandler;
    chosenHandler = data.path.startsWith('/paxterya') ? handlers.paxterya : chosenHandler;
    chosenHandler = data.path.startsWith('/paxterya/api/application') && data.method == 'post' ? handlers.paxapi.application.post : chosenHandler;
    chosenHandler = data.path.startsWith('/paxterya/api/application') && data.method == 'get' ? handlers.paxapi.application.get : chosenHandler;
    chosenHandler = data.path.startsWith('/paxterya/api/application') && data.method == 'patch' ? handlers.paxapi.application.patch : chosenHandler;
    chosenHandler = data.path.startsWith('/paxterya/login') ? handlers.paxLogin : chosenHandler;
    chosenHandler = data.path.startsWith('/paxterya/staff') ? handlers.paxStaff : chosenHandler;

    //Send the request to the chosenHandler
    try {
      chosenHandler(data, function (statusCode, payload, contentType) {
        server.processHandlerResponse(res, data.method, data.path, statusCode, payload, contentType);
      });
    } catch (e) {
      console.log(e);
      server.processHandlerResponse(res, data.method, data.path, 500, 'Internal server error :(\n(Please notify TxT#0001 on Discord if you see this!)', 'html');
    }
  });
});



//Take a request and return a nice data object w/o payload
server.getDataObject = function (req, callback) {
  var parsedUrl = url.parse(req.url, true);

  //Try to get payload, if there is some
  var decoder = new StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function (data) {
    buffer += decoder.write(data);
  });
  req.on('end', function () {
    buffer += decoder.end();
    try {
      var jsonObject = JSON.parse(buffer);
    } catch (e) {
      var jsonObject = {};
    }
    var data = {
      'path': parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
      'queryStringObject': JSON.parse(JSON.stringify(parsedUrl.query)),
      'method': req.method.toLowerCase(),
      'headers': req.headers,
      'payload': jsonObject
    };

    callback(data);
  });
};

//Take the response from the handler and process it
server.processHandlerResponse = function (res, method, path, statusCode, payload, contentType) {
  //Check responses from handler or use defaults
  statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
  contentType = typeof (contentType) == 'string' ? contentType : 'html';

  //Log 404 and 500 errors
  if (statusCode == 404) log.write(0, 'Answered web request with 404', { path: path, payload: payload });
  if (statusCode == 500) log.write(2, 'Answered web request with 500', { path: path, payload: payload });

  //Build the response parts that are content specific
  var payloadStr = '';
  if(statusCode == 301 || statusCode == 302){
    res.writeHead(statusCode, payload);
  }else{
    if (contentType == 'html') {
      res.setHeader('Content-Type', 'text/html');
      payloadStr = typeof (payload) == 'string' ? payload : '';
    }
    if (contentType == 'json') {
      res.setHeader('Content-Type', 'application/json');
      payloadStr = typeof (payload) == 'object' ? JSON.stringify(payload) : payload;
    }
    if (contentType == 'favicon') {
      res.setHeader('Content-Type', 'image/x-icon');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'css') {
      res.setHeader('Content-Type', 'text/css');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'png') {
      res.setHeader('Content-Type', 'image/png');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'jpg') {
      res.setHeader('Content-Type', 'image/jpeg');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'font') {
      res.setHeader('Content-Type', 'application/octet-stream');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'svg') {
      res.setHeader('Content-Type', 'image/svg+xml');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'js') {
      res.setHeader('Content-Type', 'application/javascript');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    if (contentType == 'plain') {
      res.setHeader('Content-Type', 'text/plain');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    res.writeHead(statusCode);
  }
  //Finish the response with the rest which is common
  res.end(payloadStr);
};

//Init
server.init = function () {
  //Start http server
  server.httpServer.listen(config["http-port"], function () {
    console.log('HTTP server online on port ' + config["http-port"]);
    log.write(1, 'HTTP server is online', { 'port': config["http-port"] });
  });
  server.httpsServer.listen(config["https-port"], function () {
    console.log('HTTPS server online on port ' + config["https-port"]);
    log.write(1, 'HTTPS server is online', { 'port': config["https-port"] });
  });
};

//Export the container
module.exports = server;
