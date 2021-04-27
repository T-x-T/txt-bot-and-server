/*
*  INDEX FOR WEBSERVER
*  contains all setup and routing for web requests
*/

import {IncomingMessage, OutgoingMessage, Server, ServerResponse} from "node:http";

//Dependencies
import http = require("http");
import StringDecoder = require("string_decoder");
import url = require("url");
import santize_path = require('sanitize-filename');
import handlers = require("./handlers.js");

export interface IRequestData {
  path: string,
  queryStringObject: any,
  method: string,
  headers: any,
  payload: any,
  cookies: any
}

module.exports = () => {
  http.createServer(function (req: IncomingMessage, res: ServerResponse) {
    if(global.g.config.web.https_redirect) {
      getDataObject(req, function (data: IRequestData) {
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
  
function uniserver(req: IncomingMessage, res: ServerResponse) {
  //Form the data object
  getDataObject(req, function (data: IRequestData) {
    //Log the request
    global.g.log(0, 'web', 'Web Request received', {data: data});

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
      chosenHandler(data, function (statusCode: number, payload: any, contentType: string) {
        processHandlerResponse(res, data.method, data.path, statusCode, payload, contentType);
      });
    } catch(e) {
      global.g.log(3, 'web', 'web request encountered a fatal error', {err: e.message, data: data});
      processHandlerResponse(res, data.method, data.path, 500, {err: e.message}, 'json');
    }
  });
};

//Take a request and return a nice data object w/o payload
function getDataObject(req: IncomingMessage, callback: Function) {
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
    let cookies: any = {};
    if(req.headers.cookie) req.headers.cookie.replace(/\s/g, '').split(';').forEach((cookie) => {
      let parts = cookie.split('=');
      cookies[parts[0]] = parts[1];
    });
    const data: IRequestData = {
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
function processHandlerResponse(res: ServerResponse, method: string, path: string, statusCode: number, payload: any, contentType: string) {
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

const router: {[path: string]: Function} = {
  '/html/api/application': handlers.paxapi.application as Function,
  '/html/api/contact': handlers.paxapi.contact as Function,
  '/html/api/member': handlers.paxapi.member as Function,
  '/html/api/blog': handlers.paxapi.blog as Function,
  '/html/api/roles': handlers.paxapi.roles as Function,
  '/html/api/mcversion': handlers.paxapi.mcversion as Function,
  '/html/api/worldmapdata': handlers.paxapi.memberworldmapdata as Function,
  '/html/api/statsoverview': handlers.paxapi.statsoverview as Function,
  '/html/api/discorduserfromcode': handlers.paxapi.discorduserfromcode as Function,
  '/html/api/tokenfromcode': handlers.paxapi.tokenfromcode as Function,
};