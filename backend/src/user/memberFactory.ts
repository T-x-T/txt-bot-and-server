import Factory = require("../persistance/factory.js");
import Member = require("./member.js");
import type {MongooseFilterQuery} from "mongoose";

export = class MemberFactory extends Factory{
  constructor(options?: IFactoryOptions) {
    super({
      schema: Member.schema,
      name: "members",
      ...options
    });
  }

  async create(discord_id: string, discord_nick?: string, mc_uuid?: string, mc_ign?: string, country?: string, birth_month?: number, birth_year?: number, publish_age?: boolean, publish_country?: boolean, status?: number, notes?: string) {
    const member = new Member(discord_id, discord_nick, typeof status == "number" ? status : EMemberStatus.default, new Date(), mc_uuid, mc_ign, country, birth_month, birth_year, publish_age, publish_country, notes);
    await member.init();
    await member.create();
    return member;
  }

  async getByDiscordId(discordId: string) {
    const member = (await this.getFiltered({discord: discordId}))[0];
    if(!member) throw new Error("No Member with discordId found: " + discordId);
    return member;
  }

  async getByMcUuid(mcUuid: string) {
    const member = (await this.getFiltered({mcUUID: mcUuid}))[0];
    if(!member) throw new Error("No Member with mcUuid found: " + mcUuid);
    return member;
  }

  getAllWhitelisted() {
    return this.getFiltered({status: EMemberStatus.active});
  }

  getAll() {
    return this.getFiltered({});
  }

  async getFiltered(filter: MongooseFilterQuery<any>) {
    if(!this.connected) await this.connect();

    const res = await this.persistanceProvider.retrieveFiltered(filter);
    return await Promise.all(res.map((m: any) => {
      const member = new Member(m.discord, m.discord_nick, m.status, new Date(m._id.getTimestamp()), m.mcUUID, m.mcName, m.country, m.birth_month, m.birth_year, m.publish_age, m.publish_country, m.notes);
      member.init();
      return member;
    }));
  }
}