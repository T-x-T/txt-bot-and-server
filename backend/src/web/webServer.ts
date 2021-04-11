/*
*  INDEX FOR WEBSERVER
*  contains all setup and routing for web requests
*/

//Dependencies
const http = require("http");
const StringDecoder = require("string_decoder");
const url = require("url");
const santize_path = require('sanitize-filename');
const handlers = require("./handlers.js");

module.exports = () => {
  http.createServer(function (req, res) {
    if(global.g.config.web.https_redirect) {
      getDataObject(req, function (data) {
        res.writeHead(302, {Location: `https://${data.headers.host}/${data.path}`});
        res.end();
      });
    } else {
      uniserver(req, res);
    }
  }).listen(global.g.config.web.http_port, function () {
    console.log('HTTP server online on port ' + global.g.config.web.http_port);
    global.g.log(1, 'web', 'HTTP server is online', {'port': global.g.config.web.http_port});
  });
};
  
function uniserver(req, res) {
  //Form the data object
  getDataObject(req, function (data) {
    //Log the request
    global.g.log(0, 'web', 'Web Request received', {data: data, sourceIP: req.connection.remoteAddress});

    //Some requests seem to come in without any header, which is bad, so lets add one here if thats the case, also log it
    if(!data.headers.hasOwnProperty('host')) {
      global.g.log(1, 'web', 'Web request without host header received', {data: data, sourceIP: req.connection.remoteAddress});
      data.headers.host = 'paxterya.com';
    }

    if(!data.path.startsWith('assets')) data.path = '/html/' + data.path;
    else data.path = data.path.replace('/paxterya', '');

    //necessary for testing purposes
    if(!global.g.config.web.use_external_certs) {
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
    var chosenHandler = handlers.notFound;
    for(let key in router) {
      chosenHandler = data.path.startsWith(key) ? router[key] : chosenHandler;
    }

    //Send the request to the chosenHandler
    try {
      chosenHandler(data, function (statusCode, payload, contentType) {
        processHandlerResponse(res, data.method, data.path, statusCode, payload, contentType);
      });
    } catch(e) {
      global.g.log(3, 'web', 'web request encountered a fatal error', {err: e.message, data: data});
      processHandlerResponse(res, data.method, data.path, 500, {err: e.message}, 'json');
    }
  });
};

//Take a request and return a nice data object w/o payload
function getDataObject(req, callback) {
  var parsedUrl = url.parse(req.url, true);

  //Try to get payload, if there is some
  var decoder = new StringDecoder.StringDecoder('utf-8');
  var buffer = '';
  req.on('data', function (data) {
    buffer += decoder.write(data);
  });
  req.on('end', function () {
    buffer += decoder.end();
    let jsonObject;
    try {
      jsonObject = JSON.parse(buffer);
    } catch(e) {
      jsonObject = {};
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
function processHandlerResponse(res, method, path, statusCode, payload, contentType) {
  //Check responses from handler or use defaults
  statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
  contentType = typeof (contentType) == 'string' ? contentType : 'html';

  //Log 404 and 500 errors
  if(statusCode == 404) global.g.log(0, 'web', 'Answered web request with 404', {path: path, payload: payload});
  if(statusCode == 500) global.g.log(2, 'web', 'Answered web request with 500', {path: path, payload: payload});

  //Build the response parts that are content specific
  var payloadStr = '';
  if(statusCode == 301 || statusCode == 302) {
    res.writeHead(statusCode, payload);
  } else {
    if(contentType == 'json') {
      res.setHeader('Content-Type', 'application/json');
      payloadStr = typeof (payload) == 'object' ? JSON.stringify(payload) : payload;
    }
    if(contentType == 'plain') {
      res.setHeader('Content-Type', 'text/plain');
      payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }
    res.writeHead(statusCode);
  }
  //Finish the response with the rest which is common
  res.end(payloadStr);
};

const router = {
  '/html/api/application': handlers.paxapi.application,
  '/html/api/contact': handlers.paxapi.contact,
  '/html/api/member': handlers.paxapi.member,
  '/html/api/blog': handlers.paxapi.blog,
  '/html/api/roles': handlers.paxapi.roles,
  '/html/api/mcversion': handlers.paxapi.mcversion,
  '/html/api/worldmapdata': handlers.paxapi.memberworldmapdata,
  '/html/api/statsoverview': handlers.paxapi.statsoverview,
  '/html/api/discorduserfromcode': handlers.paxapi.discorduserfromcode,
  '/html/api/tokenfromcode': handlers.paxapi.tokenfromcode,
};

export default {}