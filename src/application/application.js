const Persistable = require("../persistance/persistable.js");
const sanitize = require('sanitize-html');

class Application extends Persistable{
  constructor(discordId, mcUuid, emailAddress, country, birth_month, birth_year, about_me, motivation, buildImages, publishAboutMe, publishAge, publishCountry){
    if(!discordId || !mcUuid || !emailAddress || !country || !birth_month || !birth_year || !about_me || !motivation || !buildImages ||!publishAboutMe || !publishAge || !publishCountry){
      throw new Error("Missing parameter");
    }
    
    super({name: "applications", schema: Application.schema});

    this.data.timestamp = Date.now();
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
    this.data.status = 1;
  }

  accept(){

  }

  deny(){

  }

  getId(){
    
  }

  getTimestamp(){
    return this.data.timestamp;
  }

  getMcUuid(){
    return this.data.mc_uuid;
  }

  getDiscordId(){
    return this.data.discord_id;
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