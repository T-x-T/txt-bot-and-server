/*
*  INDEX FOR WEBSERVER
*  contains all setup and routing for web requests
*/

//Dependencies
const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const url = require('url');
const handlers = require('./handlers');
const santize_path = require('sanitize-filename');

//Create the container
var server = {};

//Instanciate the http server
server.httpServer = http.createServer(function (req, res) {
  if(config.web.https_redirect){
    server.getDataObject(req, function(data){
      res.writeHead(302, {Location: `https://${data.headers.host}/${data.path}`});
      res.end();
    });
  }else{
    server.uniserver(req, res);
  }
});

//https stuff
if(config.web.use_external_certs){
  server.httpsConfig = {
    'key': fs.readFileSync(path.join(config.web.cert_path, 'privkey.pem')),
    'cert': fs.readFileSync(path.join(config.web.cert_path, 'fullchain.pem'))
  };
}else{
  server.httpsConfig = {
    'key': fs.readFileSync(path.join(__dirname, '../../web/certs/localhost.key')),
    'cert': fs.readFileSync(path.join(__dirname, '../../web/certs/localhost.crt'))
  };
}

//Instanciate the https server
server.httpsServer = https.createServer(server.httpsConfig, function (req, res) {
  server.uniserver(req, res);
});

server.uniserver = function(req, res){
  //Form the data object
  server.getDataObject(req, function(data) {
    //Log the request
    global.log(0, 'web', 'Web Request received', {data: data, sourceIP: req.connection.remoteAddress});

    //Some requests seem to come in without any header, which is bad, so lets add one here if thats the case, also log it
    if(!data.headers.hasOwnProperty('host')) {
      global.log(1, 'web', 'Web request without host header received', {data: data, sourceIP: req.connection.remoteAddress});
      data.headers.host = 'paxterya.com';
    }

    if(!data.path.startsWith('assets')) data.path = '/html/' + data.path;
    else data.path = data.path.replace('/paxterya', '');

    //necessary for testing purposes
    if(!config.web.use_external_certs) {
      console.log(data.method, data.path);
      if(data.method == 'post') console.log(data.payload);
    }

    //Fixing links in staff pages
    if(data.path.startsWith('/html/staff')) {
      if(data.path.startsWith('/html/staff/assets')) data.path = data.path.replace('/html/staff', '');
      if(!data.path.startsWith('/html/staff/interface') && !data.path.startsWith('/html/staff/application') && !data.path.startsWith('/html/staff/post')) data.path = data.path.replace('/staff', '');
      if(data.path.startsWith('/assets/paxterya')) data.path = data.path.replace('paxterya/', '');
    }

    //Check the path and choose a handler
    var chosenHandler = handlers.assets;
    for(let key in router) {
      chosenHandler = data.path.startsWith(key) ? router[key] : chosenHandler;
    }

    //Send the request to the chosenHandler
    try {
      chosenHandler(data, function(statusCode, payload, contentType) {
        server.processHandlerResponse(res, data.method, data.path, statusCode, payload, contentType);
      });
    } catch(e) {
      global.log(3, 'web', 'web request encountered a fatal error', {err: e.message, data: data});
      server.processHandlerResponse(res, data.method, data.path, 500, {err: e.message}, 'json');
    }
  });
};

const router = {
  '/html': handlers.paxterya,
  '/html/api/application': handlers.paxapi.application,
  '/html/api/contact': handlers.paxapi.contact,
  '/html/api/member': handlers.paxapi.member,
  '/html/api/blog': handlers.paxapi.blog,
  '/html/api/roles': handlers.paxapi.roles,
  '/html/api/mcversion': handlers.paxapi.mcversion,
  '/html/login': handlers.paxLogin,
  '/html/staff': handlers.paxStaff
};

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
    let cookies = {};
    if(req.headers.cookie) req.headers.cookie.replace(/\s/g, '').split(';').forEach((cookie) => {
      let parts = cookie.split('=');
      cookies[parts[0]] = parts[1];
    });
    var data = {
      'path': santize_path(parsedUrl.pathname.replace(/^\/+|\/+$/g, ''), {replacement: 'ÿ'}).replace(/ÿ/g, '/').replace(/\.\./g, ''),
      'queryStringObject': JSON.parse(JSON.stringify(parsedUrl.query)),
      'method': req.method.toLowerCase(),
      'headers': req.headers,
      'payload': jsonObject,
      'cookies': cookies
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
  if (statusCode == 404) global.log(0, 'web', 'Answered web request with 404', { path: path, payload: payload });
  if (statusCode == 500) global.log(2, 'web', 'Answered web request with 500', { path: path, payload: payload });

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

//Start http server
server.httpServer.listen(config.web.http_port, function () {
  console.log('HTTP server online on port ' + config.web.http_port);
  global.log(1, 'web', 'HTTP server is online', { 'port': config.web.http_port });
});
server.httpsServer.listen(config.web.https_port, function () {
  console.log('HTTPS server online on port ' + config.web.https_port);
  global.log(1, 'web', 'HTTPS server is online', { 'port': config.web.https_port });
});


//Export the container
module.exports = server;
