/*
*  INDEX FOR WEBSERVER
*  contains all setup and routing for web requests
*/

//Dependencies
import http = require("http");
import StringDecoder = require("string_decoder");
import url = require("url");
import santize_path = require("sanitize-filename");
import handlers = require("./handlers.js");
import {IncomingMessage, ServerResponse} from "node:http";

export interface IRequestData {
  path: string,
  queryStringObject: any,
  method: string,
  headers: any,
  payload: any,
  cookies: any
}

export interface IHandlerResponse {
  status?: number,
  payload?: any,
  contentType?: "json" | "plain"
}

module.exports = () => {
  http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if(global.g.config.web.https_redirect) {
      const data = await getDataObject(req);
      res.writeHead(302, {Location: `https://${data.headers.host}/${data.path}`});
      res.end();
    } else {
      uniserver(req, res);
    }
  }).listen(global.g.config.web.http_port, function () {
    console.log("HTTP server online on port " + global.g.config.web.http_port);
    global.g.log(1, "web", "HTTP server is online", {port: global.g.config.web.http_port});
  });
};
  
async function uniserver(req: IncomingMessage, res: ServerResponse) {
  //Form the data object
  const data = await getDataObject(req);
  //Log the request
  global.g.log(0, "web", "Web Request received", {data: data});
  console.log(data.method, data.path);
  if(data.method == 'post') console.log(data.payload);

  //Some requests seem to come in without any header, which is bad, so lets add one here if thats the case, also log it
  if(!data.headers.hasOwnProperty("host")) data.headers.host = "paxterya.com";

  //Check the path and choose a handler
  let chosenHandler: (data: IRequestData) => Promise<IHandlerResponse> = handlers.notFound;
  for(let key in router) {
    chosenHandler = data.path.startsWith(key) ? router[key] : chosenHandler;
  }

  //Send the request to the chosenHandler
  try {
    let handlerResponse = await chosenHandler(data);

    if(typeof handlerResponse.contentType == "undefined") handlerResponse.contentType = "json";
    if(typeof handlerResponse.payload == "undefined") handlerResponse.payload = {};
    if(typeof handlerResponse.status == "undefined") handlerResponse.status = 200;

    processHandlerResponse(res, handlerResponse);
  } catch(e) {
    global.g.log(3, 'web', 'web request encountered a fatal error', {err: e.message, data: data});
    processHandlerResponse(res, {status: 500, payload: {message: "Something really bad happened, while we tried to process your request", err: e.message}});
  }
};

//Take a request and return a nice data object w/o payload
function getDataObject(req: IncomingMessage): Promise<IRequestData> {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(req.url, true);
    
    //Try to get payload, if there is some
    const decoder = new StringDecoder.StringDecoder("utf-8");
    let buffer = "";
    req.on("data", function (data) {
      buffer += decoder.write(data);
    });
    req.on("end", function () {
      buffer += decoder.end();

      let jsonObject;
      try {
        jsonObject = JSON.parse(buffer);
      } catch(e) {
        jsonObject = {};
      }

      let cookies: any = {};
      if(req.headers.cookie) req.headers.cookie.replace(/\s/g, "").split(";").forEach(cookie => {
        const parts = cookie.split('=');
        cookies[parts[0]] = parts[1];
      });

      resolve({
        path: santize_path(parsedUrl.pathname.replace(/^\/+|\/+$/g, ''), {replacement: 'ÿ'}).replace(/ÿ/g, '/').replace(/\.\./g, ''),
        queryStringObject: JSON.parse(JSON.stringify(parsedUrl.query)),
        method: req.method.toLowerCase(),
        headers: req.headers,
        payload: jsonObject,
        cookies: cookies
      });
    });
  });
};

const router: {[path: string]: (data: IRequestData) => Promise<IHandlerResponse>} = {
  "api/application": handlers.paxapi.application,
  "api/contact": handlers.paxapi.contact,
  "api/member": handlers.paxapi.member,
  "api/blog": handlers.paxapi.blog,
  "api/roles": handlers.paxapi.roles,
  "api/mcversion": handlers.paxapi.mcversion,
  "api/worldmapdata": handlers.paxapi.memberworldmapdata,
  "api/statsoverview": handlers.paxapi.statsoverview,
  "api/discorduserfromcode": handlers.paxapi.discorduserfromcode,
  "api/tokenfromcode": handlers.paxapi.tokenfromcode,
};

//Take the response from the handler and process it
function processHandlerResponse(res: ServerResponse, handlerResponse: IHandlerResponse) {
  const {status, payload, contentType} = handlerResponse;
  //Build the response parts that are content specific
  let payloadStr = "";
  if(status == 301 || status == 302) {
    res.writeHead(status, payload);
  } else {
    if(contentType == "json" || typeof payload == "object") {
      res.setHeader("Content-Type", "application/json");
      payloadStr = typeof (payload) == "object" ? JSON.stringify(payload) : payload;
    } else {
      res.setHeader("Content-Type", "text/plain");
      payloadStr = payload;
    }
    
    res.writeHead(status);
  }
  //Finish the response with the rest which is common
  res.end(payloadStr);
};