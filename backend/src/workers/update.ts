
//Dependencies
import helpers = require("../discord_bot/helpers.js");
import mc = require("../minecraft/index.js");
import MemberFactory = require("../user/memberFactory.js");
import discordBot = require("../discord_bot/index.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

const client = discordBot.client;

const update = {
  async updateAllIGNs() {
   return await Promise.all((await memberFactory.getAllWhitelisted()).map(async member => {
      if(member.getMcUuid()) {
        member.setMcIgn(await mc.getIGN(member.getMcUuid()));
        return member.save();
      }
    }));
  },

  //Set the nick of a user to their mc_ign
  async updateNick(discordId: string) {
    if(discordId == client.guilds.get(global.g.config.discord_bot.guild).ownerID) return; //Dont update the owner of the guild, this will fail
    const member = await memberFactory.getByDiscordId(discordId);
    const ign = member.getMcIgn();
    try {
      const discordMember = helpers.getMemberObjectByID(discordId);
      await discordMember.setNickname(ign);
    } catch(e) {
      throw new Error("Couldn't set the nickname of the discordMember: " + discordId);
    }
  },

  //Set the nick of all users to their mc_ign
  async updateAllNicks() {
    return await Promise.all((await memberFactory.getAllWhitelisted()).map(member => update.updateNick(member.getDiscordId())));
  },

  //This gets the current username of all users and writes them into the db
  async updateAllDiscordNicks() {
    return await Promise.all((await memberFactory.getAllWhitelisted()).map(async member => {
      const discordNick = await helpers.getNicknameByID(member.getDiscordId());
      member.setDiscordUserName(discordNick);
      return member.save();
    }));
  }
}

export = update;