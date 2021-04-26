const Persistable = require("../persistance/persistable.js");
const sanitize = require("sanitize-html");
const email = require("../email/index.js");
const discord_helpers = require("../discord_bot/index.js");
const discord_api = require("../discord_api/index.js");
const mc_helpers = require("../minecraft/index.js");
const MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory({});
import type {Member} from "../user/member.js";

//TODO Add enum for application status
class Application extends Persistable{
  static schema: any; //TODO fix any type

  constructor(id: number, discordId: string, mcUuid: string, emailAddress: string, country: string, birth_month: number, birth_year: number, about_me: string, motivation: string, buildImages: string, publishAboutMe: boolean, publishAge: boolean, publishCountry: boolean, status: number, timestamp: Date, discordUserName: string, mcIgn: string){
    if(!discordId || !mcUuid || !emailAddress || !country || !birth_month || !birth_year || !about_me || !motivation || !buildImages){
      throw new Error("Missing parameter");
    }
    
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
    discord_helpers.addMemberToRole(this.getDiscordId(), global.g.config.discord_bot.roles.paxterya, () => {});
    discord_helpers.getMemberObjectById(this.getDiscordId(), (discordMember: Member) => {
      if(discordMember) {
        discordMember.setNickname(this.getMcIgn())
          .catch((e: Error) => global.g.log(2, "application", "Application#accept couldnt set discord nickname", {application: this.data, err: e.message}));
      } else {
        global.g.log(2, "application", "Application#accept couldnt get discord member object", {application: this.data});
      }
    });
  }

  async createMemberFromApplication() {    
    try {
      let member = await memberFactory.getByDiscordId(this.getDiscordId())
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

        } catch(e) {
          global.g.log(2, 'application', 'failed to configure existing member object', {application: this.data, member: member, err: e.message});
          throw new Error(e.message)
        }
      } else {
        await memberFactory.create(this.getDiscordId(), this.getDiscordUserName(), this.getMcUuid(), this.getMcIgn(), this.getCountry(), this.getBirthMonth(), this.getBirthYear(), this.getPublishAge(), this.getPublishCountry(), 1);

      }
    } catch(e) {
      global.g.log(2, 'application', 'failed to get user object of accepted member', {application: this.data, err: e.message});
      throw new Error(e.message);
    }
  };

  async deny(reason: string){
    this.setStatus(2);
    if(reason) this.setDenyReason(reason);
    await this.save();
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

  setStatus(newStatus: number){
    if(newStatus < 1 || newStatus > 3) throw new Error("status must be between 1 and 3");
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
    if(this.getBirthMonth() <= new Date().getMonth() + 1) {
      return new Date().getFullYear() - this.getBirthYear();
    } else {
      return new Date().getFullYear() - this.getBirthYear() - 1;
    }
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

  getStatus(): number {
    return this.data.status;
  }

  getDenyReason(): string {
    return this.data.deny_reason;
  }

  getMcSkinUrl(): string {
    return `https://crafatar.com/renders/body/${this.getMcUuid()}?overlay=true`;
  }

  getDiscordAvatarUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      discord_api.getAvatarUrl(this.getDiscordId(), (avatarUrl: string) => {
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

export type {Application};

export default {}