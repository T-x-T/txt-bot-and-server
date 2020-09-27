const Factory = require("../persistance/factory.js");
const Member = require("./member.js");

class MemberFactory extends Factory{
  constructor(options) {
    if (typeof options != "object") var options = {};
    options.schema = Member.schema;
    options.name = "members";
    super(options);
  }

  create(discord_id, discord_nick, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country){
    return new Promise(async (resolve, reject) => {
      try{
        let member = new Member(discord_id, discord_nick, 1, new Date(), 0, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country);
        await member.init();
        await member.save();
        resolve(member);
      }catch(e){
        reject(e);
      }
    });
  }

  getByDiscordId(discord_id){
    return new Promise(async (resolve, reject) => {
      if (!discord_id) {
        reject(new Error("No discord_id given"));
        return;
      }

      let res = await this.getFiltered({ discord: discord_id });
      if (res.length === 0) return null;
      resolve(res[0]);
    });
  }

  getByMcUuid(mc_uuid){
    return new Promise(async (resolve, reject) => {
      if (!mc_uuid) {
        reject(new Error("No mc_uuid given"));
        return;
      }

      let res = await this.getFiltered({ mcUUID: mc_uuid });
      if (res.length === 0) return null;
      resolve(res[0]);
    });
  }

  getAllWhitelisted(){
    return new Promise(async (resolve, reject) => {
      let res = await this.getFiltered({status: 1});
      resolve(res);
    });
  }

  getAll(){
    return new Promise(async (resolve, reject) => {
      let res = await this.getFiltered({});
      resolve (res);
    });
  }

  getFiltered(filter){
    return new Promise(async (resolve, reject) => {
      try{
        if (!this.connected) await this.connect();

        let res = await this.persistanceProvider.retrieveFiltered(filter);
        let members = [];
        res.forEach(member => {
          members.push(new Member(member.discord, member.discord_nick, member.status, new Date(member._id.getTimestamp()).valueOf(), member.karma, member.mcUUID, member.mcName, member.country, member.birth_month, member.birth_year, member.publish_age, member.publish_country));
        });

        resolve(members);
      }catch(e){
        reject(e);
      }
    });
  }
}

module.exports = MemberFactory;