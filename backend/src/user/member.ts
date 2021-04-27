import Persistable = require("../persistance/persistable.js");
import mc = require("../minecraft/index.js");
import discord_helpers = require("../discord_bot/helpers.js");
import discord_api = require("../discord_api/index.js");

class Member extends Persistable{
  static schema: any;
  constructor(discord_id: string, discord_nick: string, status: number, joinedDate: Date, karma: number, mc_uuid: string, mc_ign: string, country: string, birth_month: number, birth_year: number, publish_age: boolean, publish_country: boolean){
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

  setDiscordUserName(newDiscordUserName: string) {
    if(newDiscordUserName.indexOf("#") === -1) throw new Error("no # in new nick");
    if(!Number.isInteger(Number.parseInt(newDiscordUserName.slice(newDiscordUserName.length - 4, newDiscordUserName.length)))) throw new Error("no discriminator");

    this.data.discord_nick = newDiscordUserName;
  }

  getDiscordAvatarUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      discord_api.getAvatarUrl(this.data.discord, (avatarUrl: string) => {
        resolve(avatarUrl);
      });
    });
  }

  getDiscordUserdata() {
    return new Promise((resolve, reject) => {
      discord_api.getUserObject({id: this.data.discord}, {fromApi: true}, (err: Error, userObject: string) => {
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

  modifyKarmaBy(modifier: number) {
    this.data.karma += modifier;
  }

  getStatus() {
    return this.data.status;
  }

  setStatus(status: number) {
    if(Member.isValidStatus(status)) {
      this.data.status = status;
    } else {
      throw new Error(`value ${status} is not a valid status`);
    }
  }

  static isValidStatus(status: number) {
    return status >= 0 && status <= 2;
  }

  getMcUuid(){
    return this.data.mcUUID ? this.data.mcUUID : false;
  }

  setMcUuid(newMcUuid: string){
    if(newMcUuid.length !== 32) throw new Error("newMcUuid must be 32 characters long");
    this.data.mcUUID = newMcUuid;
  }

  getMcIgn(){
    return this.data.mcName ? this.data.mcName : false;
  }

  setMcIgn(newIgn: string) {
    if(newIgn.length < 3 || newIgn.length > 16) throw new Error("newIgn has to be be >= 3 and <= 16");
    this.data.mcName = newIgn;
  }

  updateMcIgn() {
    return new Promise((resolve, reject) => {
      mc.getIGN(this.getMcUuid(), (err: Error, newIgn: string) => {
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

  setCountry(newCountry: string){
    this.data.country = newCountry;
  }

  getBirthMonth(){
    return this.data.birth_month ? this.data.birth_month : false;
  }

  setBirthMonth(newBirthMonth: number){
    if(newBirthMonth < 1 || newBirthMonth > 12) throw new Error("newBirthMonth must be > 0 and < 13");
    this.data.birth_month = newBirthMonth;
  }

  getBirthYear(){
    return this.data.birth_year ? this.data.birth_year : false;
  }

  setBirthYear(newBirthYear: number){
    this.data.birth_year = newBirthYear;
  }

  getAge(){
    if(!this.getBirthMonth()) return 0;
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
    return {publish_age: this.data.publish_age, publish_country: this.data.publish_country};
  }

  setPublishAge(newPublishAge: boolean){
    this.data.publish_age = newPublishAge;
  }

  setPublishCountry(newPublishCountry: boolean) {
    this.data.publish_country = newPublishCountry;
  }

  getMcSkinUrl(){
    return `https://crafatar.com/renders/body/${this.getMcUuid()}?overlay=true`;
  }

  /*
   *  LIFECYCLE
   */

  giveDiscordRole(role: string){
    return new Promise((resolve, reject) => {
      discord_helpers.addMemberToRole(this.getDiscordId(), role, (e: Error) => {
        if(e){
          reject(e);
        }else{
          resolve(null);
        }
      });
    });
  }

  takeDiscordRole(role: string){
    return new Promise((resolve, reject) => {
      discord_helpers.removeMemberFromRole(this.getDiscordId(), role, (e: Error) => {
        if (e) {
          reject(e);
        } else {
          resolve(null);
        }
      });
    });
  }

  async ban(){
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`);
    mc.sendCmd(`ban ${this.getMcIgn()}`);
    discord_helpers.banMember(this.getDiscordId());
    await this.delete();
  }

  async delete(){
    await this.persistanceProvider.deleteByFilter({discord: this.getDiscordId()});
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`);
  }

  async inactivate(){
    this.setStatus(2);
    await this.takeDiscordRole(global.g.config.discord_bot.roles.paxterya);
    await this.giveDiscordRole(global.g.config.discord_bot.roles.inactive);
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`);
  }

  async activate(){
    this.setStatus(1);
    await this.takeDiscordRole(global.g.config.discord_bot.roles.inactive);
    await this.giveDiscordRole(global.g.config.discord_bot.roles.paxterya);
    mc.sendCmd(`whitelist add ${this.getMcIgn()}`);
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
  }
};

export = Member;