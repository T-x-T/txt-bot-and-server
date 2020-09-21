const Factory = require("../persistance/factory.js");
const Member = require("./member.js");

class MemberFactory extends Factory{
  cache = [];
  constructor(options) {
    if (typeof options != "object") var options = {};
    options.schema = Member.schema;
    options.name = "members";
    super(options);
  }

  create(discord_id, discord_nick, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country){
    return new Promise(async (resolve, reject) => {
      try{
        let member = new Member(discord_id, discord_nick, 1, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country);
        await member.init();
        await member.save();
        this.cache.push(member);
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

      this.cache.forEach(member => {
        if(member.getDiscordId() === discord_id){
          resolve(member);
          return;
        }
      });

      try{
        if(!this.connected) await this.connect();
        let res = await this.persistanceProvider.retrieveFirstFiltered({discord: discord_id});
        let member = new Member(res.discord, res.discord_nick, res.status, res.mcUUID, res.mcName, res.country, res.birth_month, res.birth_year, res.publish_age, res.publish_country);
        this.cache.push(member);
        resolve(member);
      }catch(e){
        reject(e);
      }
    });
  }

  getByMcUuid(mc_uuid){
    return new Promise(async (resolve, reject) => {
      if (!mc_uuid){
        reject(new Error("No mc_uuid given"));
        return;
      } 

      this.cache.forEach(member => {
        if (member.getMcUUID() === mc_uuid) {
          resolve(member);
          return;
        }
      });

      try {
        if (!this.connected) await this.connect();
        let res = await this.persistanceProvider.retrieveFirstFiltered({mcUUID: mc_uuid});
        let member = new Member(res.discord, res.discord_nick, res.status, res.mcUUID, res.mcName, res.country, res.birth_month, res.birth_year, res.publish_age, res.publish_country);
        this.cache.push(member);
        resolve(member);
      } catch (e) {
        reject(e);
      }
    });
  }

  getAll(){
    return new Promise(async (resolve, reject) => {
      try {
        if (!this.connected) await this.connect();
        let res = await this.persistanceProvider.retrieveAll();
        let members = [];
        res.forEach(member => {
          members.push(new Member(member.discord, member.discord_nick, member.status, member.mcUUID, member.mcName, member.country, member.birth_month, member.birth_year, member.publish_age, member.publish_country));
        });
        this.cache = members;
        resolve(members);
      } catch (e) {
        reject(e);
      }
    });
  }

  emptyCache(){
    this.cache = [];
  }
}

module.exports = MemberFactory;