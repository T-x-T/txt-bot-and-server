/*
*  HANDLERS
*  Contains all functions which handle web requests
*/

//Dependencies
import auth = require("../auth/index.js");
import discordHelpers = require("../discord_helpers/index.js");
import stats = require("../stats/index.js");
import blog = require("../blog/index.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();
import ApplicationFactory = require("../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
import mc_helpers = require("../minecraft/index.js");
import sanitize = require("sanitize-html");
import email = require("../email/index.js");
import log = require("../log/index.js");

import type Application = require("../application/application.js");
import type Member = require("../user/member.js");

let config: IConfig;

const handlers = {
  init(_config: IConfig) {
    config = _config;
  },

  async notFound(_data: IRequestData): Promise<IHandlerResponse> {
    return {
      status: 404,
      payload: {err: "The page you requested is not available"}
    };
  },

  paxapi: {
    async roles(data: IRequestData): Promise<IHandlerResponse> {
      let member = null;
      try {
        member = await memberFactory.getByMcUuid(data.queryStringObject.uuid);
      } catch(_) {}
      if(member) {
        return {
          payload: {role: auth.getAccessLevelFromDiscordId(member.getDiscordId())}
        };
      } else {
        return {
          status: 404,
          payload: {err: "No Member with given uuid found"}
        };
      }
    },

    async blog(data: IRequestData): Promise<IHandlerResponse> {
      if(data.method == "post" || data.method == "put" || data.method == "get") {
        if(data.method === "get" && data.queryStringObject.hasOwnProperty("public")) {
          //Only this case is allowed without auth
          return await handlers.paxapi._blog.getPublic(data);
        } else {
          const errorMessage = await authorizeRequest(data, 9);
          if(errorMessage.length === 0) {
            return await handlers.paxapi._blog[data.method](data);
          } else {
            return {
              status: 401,
              payload: {err: errorMessage}
            };
          }
        }
      } else {
        return {
          status: 405,
          payload: {err: "Verb not allowed"}
        };
      }
    },

    _blog: {
      async post(data: IRequestData): Promise<IHandlerResponse> {
        return {
          payload: {doc: await blog.create(data.payload)}
        };
      },

      async put(data: IRequestData): Promise<IHandlerResponse> {
        return {
          payload: {doc: await blog.replace(data.payload)}
        };
      },

      async get(data: IRequestData): Promise<IHandlerResponse> {
        return {
          payload: await blog.getAll()
        };
      },

      async getPublic(data: IRequestData): Promise<IHandlerResponse> {
        return {
          payload: await blog.getPublic()
        };
      },
    },

    async member(data: IRequestData): Promise<IHandlerResponse> {
      if(data.queryStringObject.hasOwnProperty("public")) {
        return await handlers.paxapi._member.getPublic(data);
      } else {
        const errorMessage = await authorizeRequest(data, 7);
        if(errorMessage.length === 0) {
          if(data.path.endsWith("/overview")){
            return await handlers.paxapi._member.overview(data);
          }
          if(data.path.endsWith("/inactivate")) {
            return await handlers.paxapi._member.inactivate(data);
          }
          if(data.path.endsWith("/activate")) {
            return await handlers.paxapi._member.activate(data);
          }
          if(data.path.endsWith("/playtime")) {
            return await handlers.paxapi._member.getPlayTime(data);
          }
          if(data.path.endsWith("/notes") && data.method == "post") {
            return await handlers.paxapi._member.postNotes(data);
          }
          if(data.method == "get") {
            return await handlers.paxapi._member[data.method](data);
          } else {
            return {
              status: 405,
              payload: {err: "Verb not allowed"}
            };
          }
        } else {
          return {
            status: 401,
            payload: {err: errorMessage}
          };
        }
      }
    },

    _member: {
      async getPublic(data: IRequestData): Promise<IHandlerResponse> {
        return {
          payload: await stats.memberOverview()
        };
      },

      async get(data: IRequestData): Promise<IHandlerResponse> {
        if(data.queryStringObject.hasOwnProperty("discordId")){
          return {
            payload: await turnMemberIntoJson(await memberFactory.getByDiscordId(data.queryStringObject.discordId))
          }
        } else if(data.queryStringObject.hasOwnProperty("discordId")) {
          return {
            payload: await turnMemberIntoJson(await memberFactory.getByMcUuid(data.queryStringObject.mcUuid))
          }
        } else {
          const members = await memberFactory.getAll();
          const res = await Promise.allSettled(members.map(x => turnMemberIntoJson(x)));
          return {
            payload: res.map(x => x.status == "fulfilled" ? x.value : null).filter(x => x)
          }
        }
      },

      async overview(data: IRequestData): Promise<IHandlerResponse> {
        const members = await memberFactory.getAll();
        const res = await Promise.allSettled(members.map(x => turnMemberIntoOverviewJson(x)));
        return {
          payload: res.map(x => x.status == "fulfilled" ? x.value : null).filter(x => x)
        }
      },

      async inactivate(data: IRequestData): Promise<IHandlerResponse> {
        try {
          const member = await memberFactory.getByDiscordId(data.path.split("/")[data.path.split("/").length - 2]);
          await member.inactivate();
          await member.save();
          return {};
        } catch(e) {
          return {
            status: 500,
            payload: {error: e.message}
          }
        }
      },

      async activate(data: IRequestData): Promise<IHandlerResponse> {
        try {
          const member = await memberFactory.getByDiscordId(data.path.split("/")[data.path.split("/").length - 2]);
          await member.activate();
          await member.save();
          return {};
        } catch(e) {
          return {
            status: 500,
            payload: {error: e.message}
          }
        }
      },

      async getPlayTime(data: IRequestData): Promise<IHandlerResponse> {
        try {
          const member = await memberFactory.getByDiscordId(data.path.split("/")[data.path.split("/").length - 2]);
          const playtime = await stats.mcGetSingle(member.getMcUuid(), "playtime");
          return {
            payload: {playtime: playtime ? playtime : 0}
          }
        } catch(_) {
          return {
            payload: {playtime: 0}
          }
        }
      },

      async postNotes(data: IRequestData): Promise<IHandlerResponse> {
        try {
          const member = await memberFactory.getByDiscordId(data.path.split("/")[data.path.split("/").length - 2]);
          member.setNotes(data.payload.notes);
          await member.save();
          return {};
        } catch(e) {
          return {
            status: 500,
            payload: {error: e.message}
          }
        }
      }
    },

    async contact(data: IRequestData): Promise<IHandlerResponse> {
      if(data.method == "post") {
        return await handlers.paxapi._contact[data.method](data);
      } else {
        return {
          status: 405,
          payload: {err: "Verb not allowed"}
        };
      }
    },

    _contact: {
      async post(data: IRequestData): Promise<IHandlerResponse> {
        //Check the inputs
        let name: string = typeof data.payload.name == "string" && data.payload.name.length > 0 ? data.payload.name : "";
        let recipient: string = typeof data.payload.email == "string" && data.payload.email.length > 3 ? data.payload.email : "";
        let subject: string = typeof data.payload.subject == "string" && data.payload.subject.length > 0 ? data.payload.subject : "";
        let text: string = typeof data.payload.text == "string" && data.payload.text.length > 10 ? data.payload.text : "";

        if(name.length > 0 && recipient.length > 0 && subject.length > 0 && text.length > 0) {
          //Add the email of the sender to the text
          text = text + "\n\n" + recipient;

          discordHelpers.sendMessage(`Someone used the contact form!\nSubject: ${subject}\nBody: ${text}`, config.discord_bot.channel.new_application_announcement);
          email.sendContactUsEmail(subject, text);

          return {};
        } else {
          return {
            status: 400,
            payload: {err: "One of your inputs is a little off"}
          };
        }
      }
    },

    async application(data: IRequestData): Promise<IHandlerResponse> {
      if(data.method == "post" || data.method == "get" || data.method == "patch") {
        if(data.method != "post") {
          //All non post requests require authorization
          const authError = await authorizeRequest(data, 7);
          if(authError.length === 0) {
            return await handlers.paxapi._application[data.method](data);
          } else {
            return {
              status: 401,
              payload: {err: authError}
            };
          }
        } else {
          return await handlers.paxapi._application[data.method](data);
        }
      } else {
        return {
          status: 405,
          payload: {err: "Verb not allowed"}
        };
      }
    },

    _application: {
      async post(data: IRequestData): Promise<IHandlerResponse> {
        if(!data.payload || !data.payload.accept_rules || !data.payload.accept_privacy_policy) {
          return {
            status: 400,
            payload: {err: "Missing or malformed payload", payload: data.payload}
          };
        }

        const discordId: string = data.payload.discord_id.length >= 17 && data.payload.discord_id.length <= 18 ? data.payload.discord_id : "";
        const mcIgn: string = data.payload.mc_ign.length >= 3 && data.payload.mc_ign.length <= 16 ? data.payload.mc_ign : "";
        const emailAddress: string = data.payload.email_address.indexOf("@") > -1 && data.payload.email_address.length > 5 ? data.payload.email_address.trim() : "";
        const country = data.payload.country ? sanitize(data.payload.country, {allowedTags: []}) : "";
        const birthMonth = Number.parseInt(data.payload.birth_month) >= 1 && Number.parseInt(data.payload.birth_month) <= 12 ? Number.parseInt(data.payload.birth_month) : -1;
        const birthYear = Number.parseInt(data.payload.birth_year) >= 1900 && Number.isInteger(Number.parseInt(data.payload.birth_year)) ? Number.parseInt(data.payload.birth_year) : -1;
        const aboutMe = data.payload.about_me.length > 1 && data.payload.about_me.length <= 1500 ? sanitize(data.payload.about_me, {allowedTags: [], allowedAttributes: {}}) : "";
        const motivation = data.payload.motivation.length > 1 && data.payload.motivation.length <= 1500 ? sanitize(data.payload.motivation, {allowedTags: [], allowedAttributes: {}}) : "";
        const buildImages = data.payload.build_images.length > 1 && data.payload.build_images.length <= 1500 ? sanitize(data.payload.build_images, {allowedTags: [], allowedAttributes: {}}) : "";
        const publishAboutMe = data.payload.publish_about_me;
        const publishAge = data.payload.publish_age;
        const publishCountry = data.payload.publish_country;

        if(birthYear > new Date().getFullYear() - 13 || (birthYear > new Date().getFullYear() - 12 && new Date().getMonth() < birthMonth)) {
          return {
            status: 401,
            payload: {err: "you need to be at least 13 years old to apply. If you believe this is an error contact TxT#0001 in Discord"}
          };
        }

        if(discordId.length === 0 || mcIgn.length === 0 || emailAddress.length === 0 || country.length === 0 || birthMonth === -1 || birthYear === -1 || aboutMe.length === 0 || motivation.length === 0 || buildImages.length === 0) {
          const payload = {
            discordId: discordId,
            mcIgn: data.payload.mcIgn,
            emailAddress: emailAddress,
            country: country,
            birthMonth: birthMonth,
            birthYear: birthYear,
            aboutMe: aboutMe,
            motivation: motivation,
            buildImages: buildImages
          }
          log.write(0, "web", "handlers.paxapi.application.post received incorrect input", payload);
          return {
            status: 400,
            payload: {err: "Incorrect input", payload: payload}
          }
        }

        const mcUuid = await mc_helpers.getUUID(mcIgn)
        const actualMcIgn = await mc_helpers.getIGN(mcUuid);
        const userData = await discordHelpers.fetchUser(discordId);
        const discordUserName = `${userData.username}#${userData.discriminator}`;
        await applicationFactory.create(discordId, mcUuid, emailAddress, country, birthMonth, birthYear, aboutMe, motivation, buildImages, publishAboutMe, publishAge, publishCountry, 1, discordUserName, actualMcIgn);

        return {
          status: 201
        };
      },

      async get(data: IRequestData): Promise<IHandlerResponse> {
        //Clear the 0 status code, as 0 means get all data
        if(data.queryStringObject.status == 0) data.queryStringObject = {};
        return await turnFilterIntoApplication(data.queryStringObject);
      },

      async patch(data: IRequestData): Promise<IHandlerResponse> {
        //Check if the required fields are set
        const id: number = typeof data.payload.id == "number" && data.payload.id > -1 ? data.payload.id : -Infinity;
        const status: number = typeof data.payload.status == "number" && data.payload.status >= 2 && data.payload.status <= 3 ? data.payload.status : -Infinity;

        if(id > -Infinity && status > -Infinity) {
          const application = await applicationFactory.getById(id);

          if(status === 3) {
            await application.accept();
            return {};
          } else {
            await application.deny(data.payload.reason);
            return {};
          }
        } else {
          return {
            status: 401,
            payload: {err: "One of the inputs is not quite right"}
          };
        }
      }
    },

    async mcversion(data: IRequestData): Promise<IHandlerResponse> {
      try {
        return {
          payload: await mc_helpers.getServerVersion(),
          contentType: "plain"
        };
      } catch(_) {
        return {
          payload: "",
          contentType: "plain"
        }
      }
    },

    async memberworldmapdata(data: IRequestData): Promise<IHandlerResponse> {
      return {
        payload: await stats.countryList()
      };
    },

    async statsoverview(data: IRequestData): Promise<IHandlerResponse> {
      return {
        payload: await stats.overview()
      };
    },

    async discorduserfromcode(data: IRequestData): Promise<IHandlerResponse> {
      const code = data.queryStringObject.code;
      const discordId = await auth.getDiscordIdFromCode(code, "applicationNew");
      const discordUser = await discordHelpers.fetchUser(discordId)
      
      return {
        payload: {discordNick: discordUser.username + "#" + discordUser.discriminator, discordId: discordId}
      };
    },

    async tokenfromcode(data: IRequestData): Promise<IHandlerResponse> {
      const code = data.queryStringObject.code;
      const {accessToken, accessLevel} = await auth.getAccessTokenAndLevelFromCode(code, "interface");

      return {
        payload: {access_token: accessToken, access_level: accessLevel}
      };
    }
  }
};

async function authorizeRequest(data: IRequestData, minAccessLevel: number) {
  if(data.headers.hasOwnProperty("cookie")) {
    if(data.headers.cookie.indexOf("access_token".length > -1)) {
      //There is an access_token cookie, lets check if it belongs to an admin
      try {
        const accessLevel = await auth.getAccessLevelFromToken(data.cookies.access_token);
        if(accessLevel >= minAccessLevel) {
          return "";
        } else {
          return "You are not authorized to access this resource";
        }
      } catch(e) {
        return e.message;
      }
    } else {
      return "Your client didnt send an access_token, please log in again";
    }
  } else {
    return "Your client didnt send an access_token, please log in again";
  }
}

async function turnFilterIntoApplication(filter: any): Promise<IHandlerResponse> {
  switch(Object.keys(filter)[0]) {
    case "id":
      return {
        payload: await turnApplicationIntoJson(await applicationFactory.getById(filter.id), true)
      };
    case "discord_id":
      return {
        payload: await turnApplicationsIntoJson(await applicationFactory.getByDiscordId(filter.discord_id))
      };
    case "mc_uuid":
      return {
        payload: await turnApplicationsIntoJson(await applicationFactory.getByMcUuid(filter.mc_uuid))
      };
    default:
      return {
        payload: await turnApplicationsIntoJson(await applicationFactory.getFiltered({}))
      };
  }
}

async function turnApplicationsIntoJson(applications: Application[]) {
  const applicationObjects: any[] = await Promise.all(applications.map(async application => await turnApplicationIntoJson(application, false)));
  return applicationObjects.filter(x => x);
}

async function turnApplicationIntoJson(application: Application, getExpensiveData: boolean) {
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
    deny_reason: application.getDenyReason(), 
    discord_avatar_url: getExpensiveData ? await application.getDiscordAvatarUrl() : null
  };
}

async function turnMemberIntoJson(member: Member) {
  return {
    discordId: member.getDiscordId(),
    discordUserName: member.getDiscordUserName(),
    status: member.getStatus(),
    joinedDate: member.getJoinedDate(),
    mcUuid: member.getMcUuid(),
    mcIgn: member.getMcIgn(),
    country: member.getCountry(),
    age: member.getAge(),
    discordAvatarUrl: await member.getDiscordAvatarUrl(),
    mcSkinUrl: member.getMcSkinUrl(),
    notes: member.getNotes()
  }
}

async function turnMemberIntoOverviewJson(member: Member) {
  return {
    discordId: member.getDiscordId(),
    mcIgn: member.getMcIgn(),
    joinedDate: member.getJoinedDate()
  }
}

export = handlers;