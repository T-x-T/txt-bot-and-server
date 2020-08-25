const User = require ("./user.js");

class Member extends User{
  constructor(discord_id, discord_nick, mc_uuid, mc_ign, age, country, birth_month, birth_year, publish_age, publish_country){
    super(discord_id, discord_nick);

    this.data.mc_uuid = mc_uuid;
    this.data.mc_ign = mc_ign;
    this.data.age = age;
    this.data.country = country;
    this.data.birth_month = birth_month;
    this.data.birth_year = birth_year;
    this.data.publish_age = publish_age;
    this.data.publish_country = publish_country;
  }

  updateMc_ign() {

  }

  getMcSkinUrl() {

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