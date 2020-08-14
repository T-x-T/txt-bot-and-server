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
}

module.exports = Member;