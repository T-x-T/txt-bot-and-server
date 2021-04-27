import Factory = require("../persistance/factory.js");
import Member = require("./member.js");

export = class MemberFactory extends Factory{
  constructor(options?: any) { //TODO: fix any
    if (typeof options != "object") var options: any = {};
    options.schema = Member.schema;
    options.name = "members";
    super(options);
  }

  create(discord_id: string, discord_nick?: string, mc_uuid?: string, mc_ign?: string, country?: string, birth_month?: number, birth_year?: number, publish_age?: boolean, publish_country?: boolean, status?: number): Promise<Member>{
    return new Promise(async (resolve, reject) => {
      try{
        let member = new Member(discord_id, discord_nick, typeof status == 'number' ? status : 0, new Date(), 0, mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country);
        await member.init();
        await member.create();
        resolve(member);
      }catch(e){
        reject(e);
      }
    });
  }

  getByDiscordId(discord_id: string): Promise<Member>{
    return new Promise(async (resolve, reject) => {
      if (!discord_id) {
        reject(new Error("No discord_id given"));
        return;
      }

      let res: any = await this.getFiltered({ discord: discord_id });
      if (res.length === 0) {
        resolve(null);  
        return null;
      }
      resolve(res[0]);
    });
  }

  getByMcUuid(mc_uuid: string): Promise<Member>{
    return new Promise(async (resolve, reject) => {
      if (!mc_uuid) {
        reject(new Error("No mc_uuid given"));
        return;
      }

      let res: any = await this.getFiltered({ mcUUID: mc_uuid });
      if(res.length === 0) {
        resolve(null);
        return null;
      }
      resolve(res[0]);
    });
  }

  getAllWhitelisted(): Promise<Member[]>{
    return new Promise(async (resolve, reject) => {
      let res = await this.getFiltered({status: 1});
      resolve(res);
    });
  }

  getAll(): Promise<Member[]>{
    return new Promise(async (resolve, reject) => {
      let res = await this.getFiltered({});
      resolve (res);
    });
  }

  getFiltered(filter: any): Promise<Member[]>{ //TODO: fix any
    return new Promise(async (resolve, reject) => {
      try{
        if (!this.connected) await this.connect();

        let res = await this.persistanceProvider.retrieveFiltered(filter);
        let members: Member[] = [];
        res.forEach((member: any) => { //TODO: fix any
          members.push(new Member(member.discord, member.discord_nick, member.status, new Date(member._id.getTimestamp()), member.karma, member.mcUUID, member.mcName, member.country, member.birth_month, member.birth_year, member.publish_age, member.publish_country));
        });
        await Promise.all(members.map(async member => await member.init()));
        resolve(members);
      }catch(e){
        reject(e);
      }
    });
  }
}