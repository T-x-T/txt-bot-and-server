import Persistable = require("../persistance/persistable.js");
import sanitize = require("sanitize-html");
import email = require("../email/index.js");
import discord_helpers = require("../discord_helpers/index.js");
import mc_helpers = require("../minecraft/index.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
import log = require("../log/index.js");
import type Member = require("../user/member.js");
import type {SchemaDefinition} from "mongoose";

let config: IConfig;

class Application extends Persistable{
  static schema: SchemaDefinition;

  constructor(id: number, discordId: string, mcUuid: string, emailAddress: string, country: string, birth_month: number, birth_year: number, about_me: string, motivation: string, buildImages: string, publishAboutMe: boolean, publishAge: boolean, publishCountry: boolean, status: EApplicationStatus, timestamp: Date, discordUserName: string, mcIgn: string, denyReason?: string){
    super({name: "applications", schema: Application.schema});

    this.data.timestamp = timestamp ? timestamp : new Date();
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
    this.data.status = status ? status : 1;
    this.data.id = Number.isInteger(id) ? id : null;
    this.data.discord_nick = discordUserName ? discordUserName : null;
    this.data.mc_ign = mcIgn ? mcIgn : null;
    this.data.deny_reason = denyReason;
  }

  static setConfig(_config: IConfig) {
    config = _config;
  }

  /*
   *  LIFECYCLE
   */

  async accept(){
    this.setStatus(EApplicationStatus.accepted);
    await this.save();
    email.sendApplicationAcceptedMail(this);
    discord_helpers.sendMessage(`The Application of ${this.getDiscordUserName()} got accepted`, config.discord_bot.channel.mod_notifications);

    if(discord_helpers.isGuildMember(this.getDiscordId())){
      await this.acceptGuildMember();
    }
  }

  async acceptGuildMember(){
    await Promise.all([
      this.createMemberFromApplication(),
      sendAcceptedMemberWelcomeMessage(this),
      discord_helpers.addMemberToRole(this.getDiscordId(), config.discord_bot.roles.paxterya),
      mc_helpers.whitelist(this.getMcUuid())
    ]);
    const discordMember = discord_helpers.getMemberObjectById(this.getDiscordId());
    if(discordMember) {
      await discordMember.setNickname(this.getMcIgn());
    } else {
      log.write(2, "application", "Application#accept couldnt get discord member object", {application: this.data});
    }
  }

  async createMemberFromApplication() {    
    try {
      let member: Member;
      try{
        member = await memberFactory.getByDiscordId(this.getDiscordId())
      } catch(e) {
        member = await memberFactory.create(this.getDiscordId());
      }

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
    } catch(e) {
      log.write(2, "application", "createMemberFromApplication failed", {application: this.data, err: e.message});
      throw new Error(e.message);
    }
  };

  async deny(reason?: string){
    this.setStatus(EApplicationStatus.denied);
    if(reason) this.setDenyReason(reason);
    await this.save();
    discord_helpers.sendMessage(`The Application of ${this.getDiscordUserName()} got denied${reason ? ` with reason: "${reason}"` : ""}`, config.discord_bot.channel.mod_notifications);
    email.sendApplicationDeniedMail(this);
  }

  /*
   *  SETTERS
   */

  setDiscordUserName(newDiscordUserName: string){
    this.data.discord_nick = newDiscordUserName;
  }

  setMcIgn(newMcIgn: string){
    this.data.mc_ign = newMcIgn;
  }

  setStatus(newStatus: EApplicationStatus){
    this.data.status = newStatus;
  }

  setDenyReason(newDenyReason: string){
    this.data.deny_reason = newDenyReason;
  }

  setId(newId: number){
    this.data.id = newId;
  }

  /*
   *  GETTERS
   */

  getId(): number {
    return this.data.id;
  }

  getTimestamp(): Date {
    return this.data.timestamp;
  }

  getDiscordId(): string {
    return this.data.discord_id;
  }

  getMcUuid(): string {
    return this.data.mc_uuid;
  }

  getEmailAddress(): string {
    return this.data.email_address;
  }

  getCountry(): string {
    return this.data.country;
  }

  getBirthMonth(): number {
    return this.data.birth_month;
  }

  getBirthYear(): number {
    return this.data.birth_year;
  }

  getAge(): number {
    const age = new Date().getFullYear() - this.getBirthYear();
    return this.getBirthMonth() <= new Date().getMonth() + 1 ? age : age -1;
  }

  getAboutMe(): string {
    return this.data.about_me;
  }

  getMotivation(): string {
    return this.data.motivation;
  }

  getBuildImages(): string {
    return this.data.build_images;
  }

  getPublishAboutMe(): boolean {
    return this.data.publish_about_me;
  }

  getPublishAge(): boolean {
    return this.data.publish_age;
  }

  getPublishCountry(): boolean {
    return this.data.publish_country;
  }

  getDiscordUserName(): string {
    return this.data.discord_nick;
  }

  getMcIgn(): string {
    return this.data.mc_ign;
  }

  getStatus(): EApplicationStatus {
    return this.data.status;
  }

  getDenyReason(): string {
    return this.data.deny_reason;
  }

  getMcSkinUrl(): string {
    return `https://crafatar.com/renders/body/${this.getMcUuid()}?overlay=true`;
  }

  async getDiscordAvatarUrl() {
    return await discord_helpers.getAvatarUrl(this.getDiscordId());
  }
}

async function sendAcceptedMemberWelcomeMessage(application: Application) {
  let msg = "";
  if(application.getPublishAboutMe()) msg = `Welcome <@${application.getDiscordId()}> to Paxterya!\nHere is the about me text they sent us:\n${application.getAboutMe()}`;
  else msg = `Welcome <@${application.getDiscordId()}> to Paxterya!`;
  msg += "\n\nThis means you can now join the server! If you have any troubles please ping the admins!\n";
  msg += "It is also a good time to give our rules a read: https://paxterya.com/rules\n";
  msg += `Please also take a look at our FAQ: <#624992850764890122>\n`;
  msg += "The IP of the survival server is paxterya.com and the IP for the creative Server is paxterya.com:25566\n\n";
  msg += "If you encounter any issues or have any questions, feel free to contact our staff.";

  await discord_helpers.sendMessage(msg, config.discord_bot.channel.new_member_announcement);
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

export = Application;