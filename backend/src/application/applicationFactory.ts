import Factory = require("../persistance/factory.js");
import Application = require("./application.js");
import discord_helpers = require("../discord_helpers/index.js");
import email = require("../email/index.js");
import type {MongooseFilterQuery} from "mongoose";

let config: IConfig;

class ApplicationFactory extends Factory{
  constructor(options?: IFactoryOptions) {
    super({
      schema: Application.schema,
      name: "applications",
      ...options
    });
  }

  static setConfig(_config: IConfig) {
    config = _config;
  }

  //discordUserName and mcIgn are optional
  async create(discordId: string, mcUuid: string, emailAddress: string, country: string, birth_month: number, birth_year: number, about_me: string, motivation: string, buildImages: string, publishAboutMe: boolean, publishAge: boolean, publishCountry: boolean, status: number, discordUserName: string, mcIgn: string){
    if(!this.connected) await this.connect();
    if(await this.applicantHasOpenApplication(discordId, mcUuid)) throw new Error("Applicant still has open application or got accepted already");

    const application = new Application(null, discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry, status, null, discordUserName, mcIgn);
    await application.init();
    const rawResult = await application.create();
    application.setId(rawResult.id);
    announceNewApplication(application);
    sendNewApplicationEmail(application);
    return application;
  }

  async applicantHasOpenApplication(discordId: string, mcUuid: string) {
    const byDiscordId = await this.getFiltered({$and: [{discord_id: discordId}, {$or: [{status: 1}, {status: 3}]}]});
    const byMcUuid = await this.getFiltered({$and: [{mc_uuid: mcUuid}, {$or: [{status: 1}, {status: 3}]}]});
    return byDiscordId.length > 0 || byMcUuid.length > 0;
  }

  async getById(id: Number){
    let res = await this.getFiltered({id: id});
    return res[0];
  }

  async getByDiscordId(discordId: string){
    return await this.getFiltered({discord_id: discordId});
  }

  async getByMcUuid(mcUuid: string){
    return await this.getFiltered({mc_uuid: mcUuid});
  }

  async getAcceptedByDiscordId(discordId: string){
    return await this.getFiltered({$and: [{status: EApplicationStatus.accepted}, {discord_id: discordId}]});
  }

  async getFiltered(filter?: MongooseFilterQuery<any>){
    if(!this.connected) await this.connect();
    const res = await this.persistanceProvider.retrieveFiltered(filter);
    const applications: Application[] = res.map((application: any) => new Application(application.id, application.discord_id, application.mc_uuid, application.email_address, application.country, application.birth_month, application.birth_year, application.about_me, application.motivation, application.build_images, application.publish_about_me, application.publish_age, application.publish_country, application.status, new Date(application._id.getTimestamp()), application.discord_nick, application.mc_ign, application.deny_reason));
    await Promise.all(applications.map(async application => application.init()));

    return applications;
  }
}

async function announceNewApplication(application: Application){
  await discord_helpers.sendMessage("New application from " + application.getDiscordUserName() + "\nYou can find it here: https://paxterya.com/interface", config.discord_bot.channel.new_application_announcement);
}

function sendNewApplicationEmail(application: Application){
  email.sendNewApplicationMail(application);
}

export = ApplicationFactory;
