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

  getDiscordId() {
    return this.data.discord;
  }

  getJoinedDate() {
    return this.data.joinedDate;
  }

  setDiscordNick(newDiscordNick) {
    if(typeof newDiscordNick != "string") throw new Error("no input given");
    if(newDiscordNick.indexOf("#") === -1) throw new Error("no # in new nick");
    if(!Number.isInteger(Number.parseInt(newDiscordNick.slice(newDiscordNick.length - 4, newDiscordNick.length)))) throw new Error("no discriminator");

    this.data.discord_nick = newDiscordNick;
  }

  getDiscordNick() {
    return this.data.discord_nick;
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

  getMcUUID(){
    return this.data.mcUUID ? this.data.mcUUID : false;
  }

  getMcIgn(){
    return this.data.mcName ? this.data.mcName : false;
  }

  getCountry(){
    return this.data.country ? this.data.country : false;
  }

  getCountryConsiderPrivacy(){
    return this.data.publish_country ? this.getCountry() : false;
  }

  getBirthMonth(){
    return this.data.birth_month ? this.data.birth_month : false;
  }

  getBirthYear(){
    return this.data.birth_year ? this.data.birth_year : false;
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

  getMcSkinUrl(){
    return `https://crafatar.com/renders/body/${this.getMcUUID()}?overlay=true`;
  }

  setMcIgn(newIgn){
    this.data.mcName = newIgn;
  }

  async updateMcIgn(){
    return new Promise((resolve, reject) => {
      mc.getIGN(this.getMcUUID(), (err, newIgn) => {
        if(err || !newIgn){
          reject(new Error(err));
        }else{
          this.data.mc_ign = newIgn;
          resolve(newIgn);
        }
      });
    });
  }

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