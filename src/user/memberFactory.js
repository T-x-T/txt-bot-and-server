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
        let member = new Member(discord_id, discord_nick, 1, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country);
        await member.init();
        await member.save();
        resolve(member);
      }catch(e){
        reject(e);
      }
    });
  }

  async getByDiscordId(discord_id){
    return new Promise(async (resolve, reject) => {
      if (!discord_id) reject(new Error("No discord_id given"));
      try{
        await this.connect();
        let res = await this.persistanceProvider.retrieveFirstFiltered({discord: discord_id});
        resolve(new Member(res.discord, res.discord_nick, res.status, res.mcUUID, res.mcName, res.country, res.birth_month, res.birth_year, res.publish_age, res.publish_country));
      }catch(e){
        reject(e);
      }
    });
  }

  async getByMcUuid(mc_uuid){
    return new Promise(async (resolve, reject) => {
      if (!mc_uuid) reject(new Error("No mc_uuid given"));
      try {
        await this.connect();
        let res = await this.persistanceProvider.retrieveFirstFiltered({mcUUID: mc_uuid});
        resolve(new Member(res.discord, res.discord_nick, res.status, res.mcUUID, res.mcName, res.country, res.birth_month, res.birth_year, res.publish_age, res.publish_country));
      } catch (e) {
        reject(e);
      }
    });
  }
}

module.exports = MemberFactory;