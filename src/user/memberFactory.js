const Factory = require("../persistance/factory.js");
const Member = require("./member.js");

class MemberFactory extends Factory{
  constructor(options) {
    if (typeof options != "object") var options = {};
    options.schema = Member.schema;
    options.name = "members";
    super(options);
  }

  async create(discord_id, discord_nick, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country){
    return new Promise(async (resolve, reject) => {
      try{
        let member = new Member(discord_id, discord_nick, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country);
        await member.init();
        await member.save();
        resolve(member);
      }catch(e){
        reject(e);
      }
    });
  }

  async getByDiscordId(){

  }
}

module.exports = MemberFactory;