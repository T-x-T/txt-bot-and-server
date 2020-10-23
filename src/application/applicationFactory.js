const Factory = require("../persistance/factory.js");
const Application = require("./application.js");
const discord_helpers = require("../discord_bot/helpers.js");
const email = require("../email");

class ApplicationFactory extends Factory{
  constructor(options) {
    if(typeof options != "object") var options = {};
    options.schema = Application.schema;
    options.name = "applications";
    super(options);
  }

  //discordUserName and mcIgn are optional
  async create(discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry, status, discordUserName, mcIgn){
    if(!this.connected) await this.connect();
    if(await this.applicantHasOpenApplication(discordId, mcUuid)) throw new Error("Applicant still has open application or got accepted already");

    let application = new Application(null, discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry, status, discordUserName, mcIgn);
    await application.init();
    let raw_result = await application.create();
    application.setId(raw_result.id);
    this.announceNewApplication(application);
    this.sendNewApplicationEmail(application);
    return application;
  }

  async applicantHasOpenApplication(discordId, mcUuid){
    let byDiscordId = await this.getFiltered({$and: [{discord_id: discordId}, {$or: [{status: 1}, {status: 3}]}]});
    let byMcUuid = await this.getFiltered({$and: [{mc_uuid: mcUuid}, {$or: [{status: 1}, {status: 3}]}]});
    return byDiscordId.length > 0 || byMcUuid.length > 0;
  }

  announceNewApplication(application){
    discord_helpers.sendMessage('New application from ' + application.getDiscordUserName() + '\nYou can find it here: https://paxterya.com/interface', config.discord_bot.channel.new_application_announcement, function (err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', {err: err, application: application});
    });
  }

  sendNewApplicationEmail(application){
    email.sendNewApplicationMail(application);
  }

  async getById(id){
    let res = await this.getFiltered({id: id});
    if(res.length > 0) res = res[0];
    if(res.length === 0) res = null;
    return res;
  }

  async getByDiscordId(discordId){
    return await this.getFiltered({discord_id: discordId});
  }

  async getByMcUuid(mcUuid){
    return await this.getFiltered({mc_uuid: mcUuid});
  }

  async getAcceptedByDiscordId(discordId){
    let res = await this.getFiltered({$and: [{status: 3}, {discord_id: discordId}]});
    if(res.length > 0) res = res[0];
    if(res.length === 0) res = null;
    return res;
  }

  async getFiltered(filter){
    if(!this.connected) await this.connect();
    let res = await this.persistanceProvider.retrieveFiltered(filter);
    let applications = [];
    res.forEach(application => {
      applications.push(new Application(application.id, application.discord_id, application.mc_uuid, application.email_address, application.country, application.birth_month, application.birth_year, application.about_me, application.motivation, application.build_images, application.publish_about_me, application.publish_age, application.publish_country, application.status, application.discord_nick, application.mc_ign));
    });
    await Promise.all(applications.map(async application => application.init()));

    return applications;
  }
}

module.exports = ApplicationFactory;