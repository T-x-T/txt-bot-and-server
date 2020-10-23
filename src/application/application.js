const Persistable = require("../persistance/persistable.js");
const sanitize = require("sanitize-html");
const email = require("../email");
const discord_helpers = require("../discord_bot");
const discord_api = require("../discord_api");
const mc_helpers = require("../minecraft");
const MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();

class Application extends Persistable{
  constructor(id, discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry, status, timestamp, discordUserName, mcIgn){
    if(!discordId || !mcUuid || !emailAddress || !country || !birth_month || !birth_year || !about_me || !motivation || !buildImages){
      throw new Error("Missing parameter");
    }
    
    super({name: "applications", schema: Application.schema});

    this.data.timestamp = timestamp ? timestamp : Date.now();
    this.data.discord_id = discordId;
    this.data.mc_uuid = mcUuid;
    this.data.email_address = sanitize(emailAddress, {allowedTags: [], allowedAttributes: {}});
    this.data.country = country;
    this.data.birth_month = birth_month;
    this.data.birth_year = birth_year;
    this.data.about_me = sanitize(about_me, {allowedTags: [], allowedAttributes: {}});
    this.data.motivation = sanitize(motivation, {allowedTags: [], allowedAttributes: {}});
    this.data.build_images = sanitize(buildImages, {allowedTags: [], allowedAttributes: {}});
    this.data.publish_about_me = publishAboutMe;
    this.data.publish_age = publishAge;
    this.data.publish_country = publishCountry;
    this.data.status = Number.isInteger(status) ? status : 1;
    this.data.id = Number.isInteger(id) ? id : null;
    this.data.discord_nick = discordUserName ? discordUserName : null;
    this.data.mc_ign = mcIgn ? mcIgn : null;
  }

  /*
   *  LIFECYCLE
   */

  async accept(){
    this.setStatus(3);
    await this.save();
    email.sendApplicationAcceptedMail(this);

    if(discord_helpers.isGuildMember(this.getDiscordId())){
      await this.acceptGuildMember();
    }
  }

  async acceptGuildMember(){
    await this.createMemberFromApplication();
    discord_helpers.sendAcceptedMemberWelcomeMessage(this);
    mc_helpers.whitelist(this.getMcUuid());
    discord_helpers.addMemberToRole(this.getDiscordId(), config.discord_bot.roles.paxterya, () => {});
    discord_helpers.getMemberObjectById(this.getDiscordId(), discordMember => {
      if(discordMember) {
        discordMember.setNickname(this.getMcIgn())
          .catch(e => global.log(2, "application", "Application#accept couldnt set discord nickname", {application: this.data, err: e.message}));
      } else {
        global.log(2, "application", "Application#accept couldnt get discord member object", {application: this.data});
      }
    });
  }

  createMemberFromApplication() {
    return new Promise(async (resolve, reject) => {
      memberFactory.getByDiscordId(this.getDiscordId())
        .then(async member => {
          if(member) {
            try {
              member.setDiscordUserName(this.getDiscordUserName());
              member.setMcUuid(this.getMcUuid());
              member.setMcIgn(this.getMcIgn());
              member.setCountry(this.getCountry());
              member.setBirthMonth(this.getBirthMonth());
              member.setBirthYear(this.getBirthYear());
              member.setPublishAge(this.getPublishAge());
              member.setPublishCountry(this.getPublishCountry());
              member.setStatus(1);
              await member.save();
              resolve();
            } catch(e) {
              global.log(2, 'application', 'failed to configure existing member object', {application: a, member: member, err: e.message});
              reject();
            }
          } else {
            await memberFactory.create(this.getDiscordId(), this.getDiscordUserName(), this.getMcUuid(), this.getMcIgn(), this.getCountry(), this.getBirthMonth(), this.getBirthYear(), this.getPublishAge(), this.getPublishCountry(), 1);
            resolve();
          }
        })
        .catch(e => {
          global.log(2, 'application', 'failed to get user object of accepted member', {application: a, err: e.message});
          reject();
        });
    });
  };

  async deny(reason){
    this.setStatus(2);
    if(reason) this.setDenyReason(reason);
    await this.save();
    email.sendApplicationDeniedMail(this);
  }

  /*
   *  SETTERS
   */

  setDiscordUserName(newDiscordUserName){
    this.data.discord_nick = newDiscordUserName;
  }

  setMcIgn(newMcIgn){
    this.data.mc_ign = newMcIgn;
  }

  setStatus(newStatus){
    if(newStatus < 1 || newStatus > 3) throw new Error("status must be between 1 and 3");
    this.data.status = newStatus;
  }

  setDenyReason(newDenyReason){
    this.data.deny_reason = newDenyReason;
  }

  setId(newId){
    else this.data.id = newId;
  }

  /*
   *  GETTERS
   */

  getId(){
    return this.data.id;
  }

  getTimestamp(){
    return new Date(this.data.timestamp);
  }

  getDiscordId(){
    return this.data.discord_id;
  }

  getMcUuid() {
    return this.data.mc_uuid;
  }

  getEmailAddress(){
    return this.data.email_address;
  }

  getCountry(){
    return this.data.country;
  }

  getBirthMonth(){
    return this.data.birth_month;
  }

  getBirthYear(){
    return this.data.birth_year;
  }

  getAge(){
    if(this.getBirthMonth() <= new Date().getMonth() + 1) {
      return new Date().getFullYear() - this.getBirthYear();
    } else {
      return new Date().getFullYear() - this.getBirthYear() - 1;
    }
  }

  getAboutMe(){
    return this.data.about_me;
  }

  getMotivation(){
    return this.data.motivation;
  }

  getBuildImages(){
    return this.data.build_images;
  }

  getPublishAboutMe(){
    return this.data.publish_about_me;
  }

  getPublishAge(){
    return this.data.publish_age;
  }

  getPublishCountry(){
    return this.data.publish_country;
  }

  getDiscordUserName(){
    return this.data.discord_nick;
  }

  getMcIgn(){
    return this.data.mc_ign;
  }

  getStatus(){
    return this.data.status;
  }

  getDenyReason(){
    return this.data.deny_reason;
  }

  getMcSkinUrl() {
    return `https://crafatar.com/renders/body/${this.getMcUuid()}?overlay=true`;
  }

  getDiscordAvatarUrl() {
    return new Promise((resolve, reject) => {
      discord_api.getAvatarUrl(this.getDiscordId(), (avatarUrl) => {
        resolve(avatarUrl);
      });
    });
  }
}

Application.schema = {
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0,
    autoIncrement: true
  },
  timestamp: Date,
  mc_uuid: String,
  discord_id: String,
  email_address: String,
  country: String,
  birth_month: Number,
  birth_year: Number,
  about_me: String,
  motivation: String,
  build_images: String,
  publish_about_me: Boolean,
  publish_age: Boolean,
  publish_country: Boolean,
  discord_nick: String,
  mc_ign: String,
  status: {
    type: Number,
    default: 1         //1 = pending review; 2 = denied; 3 = accepted
  },
  deny_reason: String
}

module.exports = Application;