/*
*  HANDLERS
*  Contains all functions which handle web requests
*/

//Dependencies
import oauth = require("../auth/index.js");
import discord_api = require("../discord_api/index.js");
import stats = require("../stats/index.js");
import blog = require("../blog/index.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import ApplicationFactory = require("../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
import mc_helpers = require("../minecraft/index.js");
import sanitize = require('sanitize-html');

import type {IRequestData} from "./webServer.js";
import type Application = require("../application/application.js");
import type Member = require("../user/member.js");

//Create the container
var handlers: any = {};
handlers.paxapi = {};

//Not found handler
handlers.notFound = function (_data: IRequestData, callback: Function) {
  callback(404, {err: 'The page you requested is not available'}, 'json');
};

/*
*
* paxapi stuff
*
*/

//API endpoint for querying roles of players; Requires one uuid in the querystring
handlers.paxapi.roles = function(data: IRequestData, callback: Function){
  memberFactory.getByMcUuid(data.queryStringObject.uuid)
  .then((member: Member) => {
    if(member) {
      callback(200, {role: oauth.getAccessLevel({id: member.getDiscordId()}, false)}, 'json');
    } else {
      callback(404, {}, 'json');
    }
  })
  .catch((e: Error) => {
    callback(500, {err: 'encountered error while trying to execute query: ' + e.message}, 'json');
  });
};

//API functionality for handling blog posts
handlers.paxapi.blog = function(data: IRequestData, callback: Function) {
  if(typeof handlers.paxapi.blog[data.method] == 'function') {
    if(data.method === 'get' && data.queryStringObject.hasOwnProperty('public')) {
      //Only this case is allowed without auth
      handlers.paxapi.blog.getPublic(data, callback);
    } else {
      getRequestAuthorizationError(data, 9, (err: string) => {
        if(!err) {
          handlers.paxapi.blog[data.method](data, callback);
        } else {
          callback(401, {err: err}, 'json');
        }
      });
    }
  } else {
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

handlers.paxapi.blog.post = function(data: IRequestData, callback: Function) {
  blog.create(data.payload)
    .then((res: any) => callback(200, {doc: res}, 'json'))
    .catch((e: Error) => callback(500, {err: e.message}, 'json'));
};

handlers.paxapi.blog.put = function(data: IRequestData, callback: Function) {
  blog.replace(data.payload)
    .then((res: any) => callback(200, {doc: res}, 'json'))
    .catch((e: Error) => callback(500, {err: e.message}, 'json'));
}

handlers.paxapi.blog.get = function(data: IRequestData, callback: Function) {
  blog.getAll()
    .then((res: any) => callback(200, res, 'json'))
    .catch((e: Error) => callback(500, {err: e.message}, 'json'));
};

handlers.paxapi.blog.getPublic = function(data: IRequestData, callback: Function) {
  blog.getPublic()
    .then((res: any) => callback(200, res, 'json'))
    .catch((e: Error) => callback(500, {err: e.message}, 'json'));
};

//API functionallity surrounding member stuff
handlers.paxapi.member = function(data: IRequestData, callback: Function){
  if(typeof handlers.paxapi.member[data.method] == 'function'){
    handlers.paxapi.member[data.method](data, callback);
  }else{
    callback(404, { err: 'Verb not allowed' }, 'json');
  }
};

//Retrieves member objects
handlers.paxapi.member.get = function(data: IRequestData, callback: Function){
  stats.get(stats.ETemplates.memberOverview, null, function(err: string, docs: any){
    if(docs){
      callback(200, docs, 'json');
    }else{
      callback(500, {err: 'Couldnt retrieve data: ' + err}, 'json');
    }
  });
};

//API functionallity surrounding the contact form
handlers.paxapi.contact = function(data: IRequestData, callback: Function){
  if(typeof handlers.paxapi.contact[data.method] == 'function'){
    handlers.paxapi.contact[data.method](data, callback);
  }else{
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

//To send a contact email
handlers.paxapi.contact.post = function(data: IRequestData, callback: Function){
  //Check the inputs
  let name      = typeof data.payload.name == 'string' && data.payload.name.length > 0 ? data.payload.name : false;
  let recipient = typeof data.payload.email == 'string' && data.payload.email.length > 3 ? data.payload.email : false;
  let subject   = typeof data.payload.subject == 'string' && data.payload.subject.length > 0 ? data.payload.subject : false;
  let text      = typeof data.payload.text == 'string' && data.payload.text.length > 10 ? data.payload.text : false;

  if(name && recipient && subject && text){
    //Add the email of the sender to the text
    text = text + '\n\n' + recipient;

    //Send the email
    global.g.emitter.emit('contact_new', subject, text);

    callback(200, {}, 'json');
  }else{
    callback(400, {err: 'One of your inputs is a little off'}, 'json');
  }
};

handlers.paxapi.application = function(data: IRequestData, callback: Function){
  if(typeof handlers.paxapi.application[data.method] == 'function'){
    if(data.method != 'post') {
      //All non post requests require authorization
      //Check if there is an access_token
      if(data.headers.hasOwnProperty('cookie')){
        if(data.headers.cookie.indexOf('access_token'.length > -1)){
          //There is an access_token cookie, lets check if it belongs to at least a mod
          oauth.getAccessLevel({token: data.cookies.access_token}, false, function(_err: string, access_level: number){
            if(access_level >= 7){
              //The requester is allowed to get the records
              handlers.paxapi.application[data.method](data, callback);
            }else{
              callback(403, {err: 'You are not authorized to do that!'}, 'json');
            }
          });
        }else{
          callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
        }
      }else{
        callback(401, {err: 'Your client didnt send an access_token, please log in again'}, 'json');
      }
    }else{
      handlers.paxapi.application[data.method](data, callback);
    }
  }else{
    callback(405, {err: 'Verb not allowed'}, 'json');
  }
};

//To send a new application
handlers.paxapi.application.post = function(data: IRequestData, callback: Function){
  if(!data.payload || !data.payload.accept_rules || !data.payload.accept_privacy_policy){
    callback(400, {err: "Missing or malformed payload", payload: data.payload}, "json");
    return;
  }
  
  let discordId: string = data.payload.discord_id.length >= 17 && data.payload.discord_id.length <= 18 ? data.payload.discord_id : "";
  let emailAddress: string = data.payload.email_address.indexOf("@") > -1 && data.payload.email_address.length > 5 ? data.payload.email_address.trim() : "";
  let country = data.payload.country ? sanitize(data.payload.country, {allowedTags: []}) : "";
  let birthMonth = Number.parseInt(data.payload.birth_month) >= 1 && Number.parseInt(data.payload.birth_month) <= 12 ? Number.parseInt(data.payload.birth_month) : -1;
  let birthYear = Number.parseInt(data.payload.birth_year) >= 1900 && Number.isInteger(Number.parseInt(data.payload.birth_year)) ? Number.parseInt(data.payload.birth_year) : -1;
  let aboutMe = data.payload.about_me.length > 1 && data.payload.about_me.length <= 1500 ? sanitize(data.payload.about_me, {allowedTags: [], allowedAttributes: {}}) : "";
  let motivation = data.payload.motivation.length > 1 && data.payload.motivation.length <= 1500 ? sanitize(data.payload.motivation, {allowedTags: [], allowedAttributes: {}}) : "";
  let buildImages = data.payload.build_images.length > 1 && data.payload.build_images.length <= 1500 ? sanitize(data.payload.build_images, {allowedTags: [], allowedAttributes: {}}) : "";
  let publishAboutMe = data.payload.publish_about_me;
  let publishAge = data.payload.publish_age;
  let publishCountry = data.payload.publish_country;
  
  if(birthYear > new Date().getFullYear() - 13 || (birthYear > new Date().getFullYear() - 12 && new Date().getMonth() < birthMonth)){
    callback(401, {err: "you need to be at least 13 years old to apply. If you believe this is an error contact TxT#0001 in Discord"}, "json");
    return;
  }
  
  if(discordId.length === 0 || !data.payload.mc_ign || emailAddress.length === 0 || country.length === 0 || birthMonth === -1 || birthYear === -1 || aboutMe.length === 0 || motivation.length === 0 || buildImages.length === 0){
    callback(400, {err: "Incorrect input"}, "json");
    global.g.log(0, "web", "handlers.paxapi.application.post received incorrect input", {
      discordId: discordId,
      mc_ign: data.payload.mc_ign,
      emailAddress: emailAddress,
      country: country,
      birthMonth: birthMonth,
      birthYear: birthYear,
      aboutMe: aboutMe,
      motivation: motivation,
      buildImages: buildImages
    });
    return;
  }

  mc_helpers.getUUID(data.payload.mc_ign, (err: string, mcUuid: string) => {
    if(!err && mcUuid){
      mc_helpers.getIGN(mcUuid, (err: string, mcIgn: string) => {
        if(!err && mcIgn){
          discord_api.getUserObjectByIdFromApi(data.payload.discord_id, (userData: IDiscordApiUserObject) => {
            if(userData) {
              let discordUserName = `${userData.username}#${userData.discriminator}`;
              applicationFactory.create(discordId, mcUuid, emailAddress, country, birthMonth, birthYear, aboutMe, motivation, buildImages, publishAboutMe, publishAge, publishCountry, 1, discordUserName, mcIgn)
                .then(() => {
                  callback(201, {}, "json");
                })
                .catch((e: Error) => {
                  callback(500, {err: e.message}, "json");
                });
            } else {
              callback(500, {err: "Couldnt get your nickname from Discord :( Please contact TxT#0001 on Discord if you read this", payload: data.payload}, "json");
            }
          });
        }else{
          callback(500, {err: err}, "json");
        }
      });
    }else{
      callback(400, {err: "No Minecraft Account for given Minecraft In-Game-Name found", payload: data.payload}, "json");
    }
  });
};

//Retrieves a list of applications
//REQUIRES AUTHORIZATION!
//Required data: none - this will return all applications
//Optional id, discord, discord_id, mc_ign, status - these are filters, only return records matching the filter
handlers.paxapi.application.get = function(data: IRequestData, callback: Function){
  //Retrieve all records
  //Clear the 0 status code, as 0 means get all data
  if(data.queryStringObject.status == 0) data.queryStringObject = undefined;
  turnFilterIntoApplicationAndCallbackResult(data.queryStringObject, callback)
};

async function turnFilterIntoApplicationAndCallbackResult(filter: any, callback: Function){
  switch(Object.keys(filter)[0]) {
    case "id":
      applicationFactory.getById(filter.id)
        .then(async (application: Application) => {
          if(application) {
            callback(200, await turnApplicationIntoJson(application, true), "json");
          } else {
            callback(404, {err: "no application found with the given id", id: filter.id}, "json");
          }
        })
        .catch((e: Error) => {
          callback(500, {err: e.message}, "json");
        })
        .catch((e: Error) => callback(500, {err: e.message}, 'json'));
      break;
    case "discord_id":
      applicationFactory.getByDiscordId(filter.discord_id)
        .then(async (applications: Application[]) => {
          if(applications.length > 0) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no application found with the given discord_id", discord_id: filter.discord_id}, "json");
          }
        })
        .catch((e: Error) => {
          callback(500, {err: e.message}, "json");
        })
      break;
    case "mc_uuid":
      applicationFactory.getByMcUuid(filter.mc_uuid)
        .then(async (applications: Application[]) => {
          if(applications.length > 0) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no application found with the given mc_uuid", mc_uuid: filter.mc_uuid}, "json");
          }
        })
        .catch((e: Error) => {
          callback(500, {err: e.message}, "json");
        })
      break;
    default:
      applicationFactory.getFiltered({})
        .then(async (applications: Application[]) => {
          if(applications.length > 0) {
            callback(200, await turnApplicationsIntoJson(applications), "json");
          } else {
            callback(404, {err: "no applications found"}, "json");
          }
        })
        .catch((e: Error) => {
          callback(500, {err: e.message}, "json");
        })
      break;
  }
}

async function turnApplicationsIntoJson(applications: Application[]) {
  let applicationObjects: any[] = [];
  (await Promise.all(applications.map(async application => await turnApplicationIntoJson(application, false)))).forEach(application => {
    if(application) applicationObjects.push(application);
  });
  return applicationObjects;
}

async function turnApplicationIntoJson(application: Application, getExpensiveData: boolean){
  let discordAvatarUrl = null;
  if(getExpensiveData) discordAvatarUrl = await application.getDiscordAvatarUrl();
  return {
    id: application.getId(),
    timestamp: application.getTimestamp().valueOf(),
    mc_uuid: application.getMcUuid(),
    discord_id: application.getDiscordId(),
    country: application.getCountry(),
    birth_month: application.getBirthMonth(),
    birth_year: application.getBirthYear(),
    about_me: application.getAboutMe(),
    motivation: application.getMotivation(),
    build_images: application.getBuildImages(),
    publish_about_me: application.getPublishAboutMe(),
    publish_age: application.getPublishAge(),
    publish_country: application.getPublishCountry(),
    discord_nick: application.getDiscordUserName(),
    mc_ign: application.getMcIgn(),
    status: application.getStatus(),
    mc_skin_url: application.getMcSkinUrl(),
    discord_avatar_url: discordAvatarUrl
  };
}

//To change the status of a single application
//REQUIRES AUTHORIZATION!
//Required data: id, new status (2 or 3)
handlers.paxapi.application.patch = function(data: IRequestData, callback: Function){
  //Check if the required fields are set
  let id     = typeof data.payload.id     == 'number' && data.payload.id     > -1 ? data.payload.id     : false;
  let status = typeof data.payload.status == 'number' && data.payload.status >= 2 && data.payload.status <= 3 ? data.payload.status : false;

  if(typeof id == 'number' && status){
    applicationFactory.getById(id)
    .then(async (application: Application) => {
      if(application){
        if(application.getStatus() !== 2){
          if(status === 3){
            await application.accept();
            callback(200, {}, "json");
          } else {
            await application.deny(data.payload.reason);
            callback(200, {}, "json");
          }
        }else{
          callback(401, {err: "The application got already decided upon. Please refresh your browser!"}, "json");
        }
      }else{
        callback(404, {err: "No application with given id found", id: id}, "json");
      }
    })
    .catch((e: Error) => {
      callback(500, {err: e.message}, "json");
    });
  }else{
    callback(401, {err: 'One of the inputs is not quite right'}, 'json');
  }
};

handlers.paxapi.mcversion = function(data: IRequestData, callback: Function){
  mc_helpers.getServerVersion((version: string) => {
    if(version){
      callback(200, version, "plain");
    }else{
      callback(500, {err: "Couldnt get version"}, "json");
    }
  });
}

handlers.paxapi.memberworldmapdata = function(data: IRequestData, callback: Function) {
  stats.get(stats.ETemplates.countryList, null, function(err: string, map_data: any){
    if(!err){
      callback(200, map_data, "json");
    }else{
      callback(500, {err: "Couldnt get map data", details: err}, "json");
    }
  });
}

handlers.paxapi.statsoverview = function(data: IRequestData, callback: Function){
  stats.get(stats.ETemplates.overview, null, function(err: string, stats: any){
    if(!err && stats){
      callback(200, stats, "json");
    }else{
      callback(500, {err: "failed to get stats overview", stats: stats, details: err}, "json");
    }
  });
}

handlers.paxapi.discorduserfromcode = function(data: IRequestData, callback: Function){
  const code = data.queryStringObject.code;
  oauth.getDiscordId({code: code}, {redirect: "applicationNew"}, function(err: string, discordId: string){
    if(!err && discordId){
      discord_api.getNicknameByID(discordId, function(discordNick: string){
        if(discordNick){
          callback(200, {discordNick: discordNick, discordId: discordId}, "json");
        }else{
          callback(500, {err: `Couldnt turn discord id ${discordId} into username`});
        }
      });
    }else{
      callback(500, {err}, "json");
    }
  });
}

handlers.paxapi.tokenfromcode = function(data: IRequestData, callback: Function){
  const code = data.queryStringObject.code;
  oauth.getAccessLevel({code: code}, {redirect: 'interface'}, function(err: string, access_level: number, access_token: string) {
    if(access_token && !err){
      callback(200, {access_token: access_token, access_level: access_level}, "json");
    }else{
      callback(500, {err}, "json");
    }
  });
}

//Internal helper functions to make code cleaner
var _internal: any = {};

//Redirect user to the same url with the discord_id as queryStringObject
_internal.redirectToDiscordId = function(data: IRequestData, callback: Function){
  let code = data.queryStringObject.code;
  oauth.getDiscordId({code: code}, {redirect: 'application'}, function(err: string, id: number){
    if(id){
      callback(302, {Location: `https://${data.headers.host}/${data.path.replace('/html/', '')}?id=${id}`}, 'plain');
    }else{
      callback(500, 'Couldnt get your user data from discord', 'html');
    }
  });
};

function getRequestAuthorizationError(data: IRequestData, minAccessLevel: number, callback: Function) {
  if(data.headers.hasOwnProperty('cookie')) {
    if(data.headers.cookie.indexOf('access_token'.length > -1)) {
      //There is an access_token cookie, lets check if it belongs to an admin
      oauth.getAccessLevel({token: data.cookies.access_token}, false, function(err: string, accessLevel: number) {
        if(accessLevel >= minAccessLevel) {
          callback(false)
        } else {
          callback('You are not authorized to access this resource');
        }
      });
    } else {
      callback('Your client didnt send an access_token, please log in again');
    }
  } else {
    callback('Your client didnt send an access_token, please log in again');
  }
}

export = handlers;
