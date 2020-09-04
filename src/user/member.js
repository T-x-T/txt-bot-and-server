const User = require ("./user.js");
const mc = require("../minecraft");

class Member extends User{
  constructor(discord_id, discord_nick, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country){
    super(discord_id, discord_nick);

    this.data.mcUUID = mc_uuid;
    this.data.mcName = mc_ign;
    this.data.country = country;
    this.data.birth_month = birth_month;
    this.data.birth_year = birth_year;
    this.data.publish_age = publish_age;
    this.data.publish_country = publish_country;
  }

  getmcUUID(){

  }

  getMcIgn(){

  }

  getCountry(){

  }

  getCountryConsiderPrivacy(){

  }

  getBirthMonth(){

  }

  getBirthYear(){

  }

  getPrivacySettings(){

  }

  getMcSkinUrl(){
    return `https://crafatar.com/renders/body/${this.data.mcUUID}?overlay=true`;
  }

  async updateMcIgn(){
    return new Promise((resolve, reject) => {
      mc.getIGN(this.data.mcUUID, (err, newIgn) => {
        if(err || !newIgn){
          reject(new Error(err));
        }else{
          this.data.mc_ign = newIgn;
          resolve(newIgn);
        }
      });
    });
  }

  ban(){

  }

  inactivate(){

  }

  activate(){
    
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