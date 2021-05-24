import Persistable = require("../persistance/persistable.js");
import mc = require("../minecraft/index.js");
import discord_helpers = require("../discord_helpers/index.js");

class Member extends Persistable{
  static schema: any;
  static config: IConfig;

  constructor(discord_id: string, discord_nick: string, status: EMemberStatus, joinedDate: Date, mc_uuid: string, mc_ign: string, country: string, birth_month: number, birth_year: number, publish_age: boolean, publish_country: boolean, notes: string, modLog: IModLogEntry[]){
    super({name: "members", schema: Member.schema});

    this.data.discord = discord_id;
    this.data.discord_nick = discord_nick;
    this.data.status = status;
    this.data.joinedDate = joinedDate ? joinedDate : new Date();
    this.data.mcUUID = mc_uuid;
    this.data.mcName = mc_ign;
    this.data.country = country;
    this.data.birth_month = birth_month;
    this.data.birth_year = birth_year;
    this.data.publish_age = publish_age;
    this.data.publish_country = publish_country;
    this.data.notes = notes;
    this.data.modLog = modLog ? modLog : [];
  }

  /*
   *  BASIC GETTER/SETTER
   */

  getDiscordId(): string {
    return this.data.discord;
  }

  getDiscordUserName(): string {
    return this.data.discord_nick;
  }

  setDiscordUserName(newDiscordUserName: string) {
    if(newDiscordUserName.indexOf("#") === -1) throw new Error("no # in new nick");
    if(!Number.isInteger(Number.parseInt(newDiscordUserName.slice(newDiscordUserName.length - 4, newDiscordUserName.length)))) throw new Error("no discriminator");

    this.data.discord_nick = newDiscordUserName;
  }

  async getDiscordAvatarUrl() {
    return discord_helpers.getAvatarUrl(this.getDiscordId());
  }

  async getDiscordUserdata() {
    return discord_helpers.fetchUser(this.getDiscordId());
  }

  getJoinedDate(): Date {
    return this.data.joinedDate;
  }

  getStatus(): EMemberStatus {
    return this.data.status;
  }

  setStatus(status: EMemberStatus) {
    this.data.status = status;
  }

  getMcUuid(): string{
    return this.data.mcUUID ? this.data.mcUUID : false;
  }

  setMcUuid(newMcUuid: string){
    if(newMcUuid.length !== 32) throw new Error("newMcUuid must be 32 characters long");
    this.data.mcUUID = newMcUuid;
  }

  getMcIgn(): string{
    return this.data.mcName ? this.data.mcName : false;
  }

  setMcIgn(newIgn: string) {
    if(newIgn.length < 3 || newIgn.length > 16) throw new Error("newIgn has to be be >= 3 and <= 16");
    this.data.mcName = newIgn;
  }

  getCountry(): string {
    return this.data.country ? this.data.country : false;
  }

  getCountryConsiderPrivacy(): string | boolean{
    return this.data.publish_country ? this.getCountry() : false;
  }

  setCountry(newCountry: string){
    this.data.country = newCountry;
  }

  getBirthMonth(): number {
    return this.data.birth_month;
  }

  setBirthMonth(newBirthMonth: number){
    if(newBirthMonth < 1 || newBirthMonth > 12) throw new Error("newBirthMonth must be > 0 and < 13");
    this.data.birth_month = newBirthMonth;
  }

  getBirthYear(): number {
    return this.data.birth_year;
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

  getAgeConsiderPrivacy() {
    return this.data.publish_age ? this.getAge() : false;
  }

  getPrivacySettings(){
    return {publish_age: this.data.publish_age as boolean, publish_country: this.data.publish_country as boolean};
  }

  setPublishAge(newPublishAge: boolean){
    this.data.publish_age = newPublishAge;
  }

  setPublishCountry(newPublishCountry: boolean) {
    this.data.publish_country = newPublishCountry;
  }

  getMcSkinUrl(): string {
    return `https://crafatar.com/renders/body/${this.getMcUuid()}?overlay=true`;
  }

  getNotes(): string {
    return this.data.notes;
  }

  setNotes(notes: string) {
    this.data.notes = notes;
  }

  getModLog(): IModLogEntry[] {
    return this.data.modLog;
  }

  addModLog(modLog: IModLogEntry) {
    this.data.modLog.push(modLog);
  }

  /*
   *  LIFECYCLE
   */

  giveDiscordRole(role: string){
    return discord_helpers.addMemberToRole(this.getDiscordId(), role);
  }

  takeDiscordRole(role: string){
    return discord_helpers.removeMemberFromRole(this.getDiscordId(), role);
  }

  async ban(){
    mc.sendCmd(`whitelist remove ${this.getMcIgn()}`);
    mc.sendCmd(`ban ${this.getMcIgn()}`);
    discord_helpers.banMember(this.getDiscordId());
    await this.delete();
  }

  async delete(){
    await this.persistanceProvider.deleteByFilter({discord: this.getDiscordId()});
    await mc.sendCmd(`whitelist remove ${this.getMcIgn()}`);
  }

  async inactivate(){
    this.setStatus(EMemberStatus.inactive);
    await this.takeDiscordRole(Member.config.discord_bot.roles.paxterya);
    await this.giveDiscordRole(Member.config.discord_bot.roles.inactive);
    await mc.sendCmd(`whitelist remove ${this.getMcIgn()}`);
  }

  async activate(){
    this.setStatus(EMemberStatus.active);
    await this.takeDiscordRole(Member.config.discord_bot.roles.inactive);
    await this.giveDiscordRole(Member.config.discord_bot.roles.paxterya);
    await mc.sendCmd(`whitelist add ${this.getMcIgn()}`);
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
  notes: {
    type: String,
    default: ""
  },
  modLog: Array,
  karma: {
    type: Number,
    default: 0
  }
};

export = Member;