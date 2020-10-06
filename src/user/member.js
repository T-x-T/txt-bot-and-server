const Persistable = require("../persistance/persistable.js");
const mc = require("../minecraft");
const discord_helpers = require("../discord_bot/helpers.js");
const discord_api = require("../discord_api");

class Member extends Persistable{
  constructor(discord_id, discord_nick, status, joinedDate, karma, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country){
    super({name: "members", schema: Member.schema});

    this.data.discord = discord_id;
    this.data.discord_nick = discord_nick;
    this.data.status = Member.isValidStatus(status) ? status : 0;
    this.data.joinedDate = joinedDate ? joinedDate : new Date();
    this.data.karma = karma;
    this.data.mcUUID = mc_uuid;
    this.data.mcName = mc_ign;
    this.data.country = country;
    this.data.birth_month = birth_month;
    this.data.birth_year = birth_year;
    this.data.publish_age = publish_age;
    this.data.publish_country = publish_country;
  }

  /*
   *  BASIC GETTER/SETTER
   */

  getDiscordId() {
    return this.data.discord;
  }

  getDiscordUserName() {
    return this.data.discord_nick;
  }

  setDiscordUserName(newDiscordUserName) {
    if(typeof newDiscordUserName != "string") throw new Error("no input given");
    if(newDiscordUserName.indexOf("#") === -1) throw new Error("no # in new nick");
    if(!Number.isInteger(Number.parseInt(newDiscordUserName.slice(newDiscordUserName.length - 4, newDiscordUserName.length)))) throw new Error("no discriminator");

    this.data.discord_nick = newDiscordUserName;
  }

  getDiscordAvatarUrl() {
    return new Promise((resolve, reject) => {
      discord_api.getAvatarUrl(this.data.discord, (avatarUrl) => {
        resolve(avatarUrl);
      });
    });
  }

  getDiscordUserdata() {
    return new Promise((resolve, reject) => {
      discord_api.getUserObject({id: this.data.discord}, {fromApi: true}, (err, userObject) => {
        if(err) {
          reject(err);
        } else {
          resolve(userObject);
        }
      });
    });
  }

  getJoinedDate() {
    return this.data.joinedDate;
  }

  getKarma() {
    return this.data.karma;
  }

  modifyKarmaBy(modifier) {
    this.data.karma += modifier;
  }

  getStatus() {
    return this.data.status;
  }

  setStatus(status) {
    if(Member.isValidStatus(status)) {
      this.data.status = status;
    } else {
      throw new Error(`value ${status} is not a valid status`);
    }
  }

  static isValidStatus(status) {
    return status >= 0 && status <= 2;
  }

  getMcUuid(){
    return this.data.mcUUID ? this.data.mcUUID : false;
  }

  setMcUuid(newMcUuid){
    if(typeof newMcUuid !== "string") throw new Error("newMcUuid must be of type string");
    if(newMcUuid.length !== 32) throw new Error("newMcUuid must be 32 characters long");
    this.data.mcUUID = newMcUuid;
  }

  getMcIgn(){
    return this.data.mcName ? this.data.mcName : false;
  }

  setMcIgn(newIgn) {
    if(typeof newIgn !== "string") throw new Error("newIgn must be of type string");
    if(newIgn.length < 3 || newIgn.length > 16) throw new Error("newIgn has to be be >= 3 and <= 16");
    this.data.mcName = newIgn;
  }

  updateMcIgn() {
    return new Promise((resolve, reject) => {
      mc.getIGN(this.getMcUuid(), (err, newIgn) => {
        if(err || !newIgn) {
          reject(err);
        } else {
          this.data.mc_ign = newIgn;
          resolve(newIgn);
        }
      });
    });
  }

  getCountry(){
    return this.data.country ? this.data.country : false;
  }

  getCountryConsiderPrivacy(){
    return this.data.publish_country ? this.getCountry() : false;
  }

  setCountry(newCountry){
    if(typeof newCountry !== "string") throw new Error("newCountry must be of type string");
    this.data.country = newCountry;
  }

  getBirthMonth(){
    return this.data.birth_month ? this.data.birth_month : false;
  }

  setBirthMonth(newBirthMonth){
    if(!Number.isInteger(newBirthMonth)) throw new Error("newBirthMonth must be Integer");
    if(newBirthMonth < 1 || newBirthMonth > 12) throw new Error("newBirthMonth must be > 0 and < 13");
    this.data.birth_month = newBirthMonth;
  }

  getBirthYear(){
    return this.data.birth_year ? this.data.birth_year : false;
  }

  setBirthYear(newBirthYear){
    if(!Number.isInteger(newBirthYear)) throw new Error("newBirthYear must be Integer");
    this.data.birth_year = newBirthYear;
  }

  getAge(){
    if(!this.getBirthMonth()) return false;
    if (this.getBirthMonth() <= new Date().getMonth() + 1){
      return new Date().getFullYear() - this.getBirthYear();
    }else{
      return new Date().getFullYear() - this.getBirthYear() - 1;
    }
  }

  getAgeConsiderPrivacy(){
    return this.data.publish_age ? this.getAge() : false;
  }

  getPrivacySettings(){
    return this.data.publish_age ? {publish_age: this.data.publish_age, publish_country: this.data.publish_country} : false;
  }

  setPublishAge(newPublishAge){
    if(typeof newPublishAge !== "boolean") throw new Error("newPublishAge must be of type boolean");
    this.data.publish_age = newPublishAge;
  }

  setPublishCountry(newPublishCountry) {
    if(typeof newPublishCountry !== "boolean") throw new Error("newPublishCountry must be of type boolean");
    this.data.publish_country = newPublishCountry;
  }

  getMcSkinUrl(){
    return `https://crafatar.com/renders/body/${this.getMcUuid()}?overlay=true`;
  }

  /*
   *  LIFECYCLE
   */

  giveDiscordRole(role){
    return new Promise((resolve, reject) => {
      discord_helpers.addMemberToRole(this.getDiscordId(), role, e => {
        if(e){
          reject(e);
        }else{
          resolve();
        }
      });
    });
  }

  takeDiscordRole(role){
    return new Promise((resolve, reject) => {
      discord_helpers.removeMemberFromRole(this.getDiscordId(), role, e => {
        if (e) {
          reject(e);
        } else {
          resolve();
        }
      });
    });
  }

  async ban(){
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`, false);
    mc.sendCmd(`ban ${this.getMcIgn()}`, false);
    discord_helpers.banMember(this.getDiscordId());
    this.delete();
  }

  async delete(){
    await this.persistanceProvider.deleteByFilter({discord: this.getDiscordId()});
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`, false);
  }

  async inactivate(){
    this.setStatus(2);
    await this.takeDiscordRole(config.discord_bot.roles.paxterya);
    await this.giveDiscordRole(config.discord_bot.roles.inactive);
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`, false);
  }

  async activate(){
    this.setStatus(1);
    await this.takeDiscordRole(config.discord_bot.roles.inactive);
    await this.giveDiscordRole(config.discord_bot.roles.paxterya);
    mc.sendCmd(`whitelist add ${this.getMcIgn()}`, false);
  }
}

Member.schema = {
  discord: {
    type: String,
    index: true,
    unique: true
  },
  discord_nick: String,
  mcName: String,
  mcUUID: {
    type: String,
    default: null
  },
  status: {
    type: Number,
    default: 0
  }, //0 = regular pleb, 1 = whitelisted paxterya member, 2 = inactive paxterya member
  birth_year: Number,
  birth_month: Number,
  country: String,
  publish_age: Boolean,
  publish_country: Boolean,
  karma: {
    type: Number,
    default: 0
  },
  read_cards: Array
};

module.exports = Member;