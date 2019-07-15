/*
 *  INDEX FOR WEBSERVER
 *  contains all setup and routing for web requests
 */

//@TODO: Obtain better https certs

//Dependencies
const config = require('./../config.js');
const http = require('http');
const https = require('https');
const StringDecoder = require('string_decoder').StringDecoder;
const fs = require('fs');
const path = require('path');
const url = require('url');
const handlers = require('./handlers');

//Create the container
var server = {};

//Instanciate the http server
server.httpServer = http.createServer(function (req, res) {
    server.uniServer(req, res);
});

//https stuff
server.httpsConfig = {
    'key': fs.readFileSync(path.join(__dirname, './certs/key.pem')),
	'cert': fs.readFileSync(path.join(__dirname, './certs/cert.pem'))
};

//Instanciate the https server
server.httpsServer = https.createServer(server.httpsConfig, function (req, res) {
    server.uniServer(req, res);
});

//Contains all server logic for http and https
server.uniServer = function (req, res) {
	//Form the data object
    var data = this.getDataObject(req);
    //console.log(data.path);
    //Check the path and choose a handler
    var chosenHandler = typeof (server.router[data.path]) !== 'undefined' ? server.router[data.path] : handlers.html;
    chosenHandler = data.path.indexOf('assets') > -1 ? handlers.assets : chosenHandler;

    //Send the request to the chosenHandler
    try {
        chosenHandler(data, function (statusCode, payload, contentType) {
            server.processHandlerResponse(res, data.method, data.path, statusCode, payload, contentType);
        });
    } catch (e) {
        //                                                                                                          @TODO: Log the error
        console.log(e);
        server.processHandlerResponse(res, data.method, data.path, 500, 'Internal server error :(\n(Please notify TxT#0001 on Discord if you see this!)', 'html');
    }

    
};

//Take a request and return a nice data object w/o payload
server.getDataObject = function (req) {
    var parsedUrl = url.parse(req.url, true);

	//Try to get payload, if there is some
    var decoder = new StringDecoder('utf-8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();
    });
    try {
        var jsonObject = JSON.parse(buffer);
    } catch (e) {
        var jsonObject = {};
    }
    var data = {
        'path': parsedUrl.pathname.replace(/^\/+|\/+$/g, ''),
        'queryStringObject': parsedUrl.query,
        'method': req.method.toLowerCase(),
        'headers': req.headers,
        'payload': jsonObject
    };

    return data;
};

//Take the response from the handler and process it
server.processHandlerResponse = function (res, method, path, statusCode, payload, contentType) {
    //Check responses from handler or use defaults
    statusCode = typeof (statusCode) == 'number' ? statusCode : 200;
    contentType = typeof (contentType) == 'string' ? contentType : 'html';

    //Build the response parts that are content specific
    var payloadStr = '';
    if (contentType == 'html') {
        res.setHeader('Content-Type', 'text/html');
        payloadStr = typeof (payload) == 'string' ? payload : '';
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
    if (contentType == 'plain') {
        res.setHeader('Content-Type', 'text/plain');
        payloadStr = typeof (payload) !== 'undefined' ? payload : '';
    }

    //Finish the response with the rest which is common
    res.writeHead(statusCode);
    res.end(payloadStr);
};

//Define all possible routes
server.router = {
    '': handlers.index
};

//Init
server.init = function () {
	//Start http server
    server.httpServer.listen(3000, function () {
        console.log('HTTP server online on port ' + 3000);
    });
    server.httpsServer.listen(3001, function () {
        console.log('HTTPS server online on port ' + 3001);
    });
};

//Export the container
module.exports = server;