const User = require ("./user.js");
const mc = require("../minecraft");
const discord_helpers = require("../discord_bot");

class Member extends User{
  constructor(discord_id, discord_nick, status, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country){
    super(discord_id, discord_nick, status);

    this.data.mcUUID = mc_uuid;
    this.data.mcName = mc_ign;
    this.data.country = country;
    this.data.birth_month = birth_month;
    this.data.birth_year = birth_year;
    this.data.publish_age = publish_age;
    this.data.publish_country = publish_country;
  }

  getMcUUID(){
    return this.data.mcUUID
  }

  getMcIgn(){
    return this.data.mcName;
  }

  getCountry(){
    return this.data.country;
  }

  getCountryConsiderPrivacy(){
    return this.data.publish_country ? this.getCountry() : false;
  }

  getBirthMonth(){
    return this.data.birth_month;
  }

  getBirthYear(){
    return this.data.birth_year;
  }

  getAge(){
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

  getMcSkinUrl(){
    return `https://crafatar.com/renders/body/${this.getMcUUID()}?overlay=true`;
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

  }

  async inactivate(){
    this.setStatus(2);
    await this.giveDiscordRole(config.discord_bot.roles.inactive);
    //remove from whitelist
  }

  async activate(){
    this.setStatus(1);
    await this.giveDiscordRole(config.discord_bot.roles.paxterya);
    //add to whitelist
  }

  setDiscordNickToMcIgn() {
    return new Promise((resolve, reject) => {
      if (this.data.discord == client.guilds.get(config.discord_bot.guild).ownerID) resolve(); //Dont update the owner of the guild, this will fail
      else {
        discord_helpers.getMemberObjectByID(this.data.discord, (memberObj) => {
          memberObj.setNickname(this.data.mcName)
            .then(() => resolve())
            .catch(e => global.log(2, 'discord_bot', 'User#setDiscordNickToMcIgn failed to set the users nickname', { user: this.data.discord, err: e }));
        });
      }
    });
  }
}

module.exports = Member;