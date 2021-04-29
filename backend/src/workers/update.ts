
//Dependencies
import discord_api = require("../discord_api/index.js");
import helpers = require("../discord_bot/helpers.js");
import mc = require("../minecraft/index.js");
import MemberFactory = require("../user/memberFactory.js");
const memberFactory = new MemberFactory();
memberFactory.connect();

import Discord = require("discord.js");
import type Member = require("../user/member.js");

let client: Discord.Client;
global.g.emitter.once('discord_bot_ready', (_client: Discord.Client) => {
  client = _client;
});

const update = {
  //Updates all IGNs from all members based on their UUID
  updateAllIGNs() {
    //Get all members from db
    memberFactory.getAll()
      .then((members: Member[]) => {
        members.forEach(async member => {
          //Check if the user has a ign, if not, then we have nothing to do
          if(member.getMcUuid() != null) {
            //Get the ign for the uuid
            const ign = await mc.getIGN(member.getMcUuid());
            member.setMcIgn(ign);
            member.save();
          }
        });
      })
      .catch((e: Error) => {
        global.g.log(2, 'workers', 'mc.updateAllIGNs couldnt get members');
      });
  },

  //Set the nick of a user to their mc_ign
  updateNick(discord_id: string) {
    if(discord_id == client.guilds.get(global.g.config.discord_bot.guild).ownerID) return; //Dont update the owner of the guild, this will fail
    memberFactory.getByDiscordId(discord_id)
      .then((member: Member) => {
        global.g.log(0, 'workers', 'discord_helpers.updateNick got member object', {member: member.data});
        let ign = typeof member.getMcIgn() == 'string' ? member.getMcIgn() : '';
        //Get the members object
        const discordMember = helpers.getMemberObjectByID(discord_id);
          if(discordMember) {
            //Now its time to change the users nick
            discordMember.setNickname(ign)
              .catch((e: Error) => {global.g.log(2, 'workers', 'discord_helpers.updateNick failed to set the members nickname', {user: discord_id, err: e.message});});
          } else {
            global.g.log(2, 'workers', 'discord_helpers.updateNick couldnt get the member object', {user: discord_id, discordMember: discordMember});
          }
      })
      .catch((e: Error) => {
        global.g.log(2, 'workers', 'discord_helpers.updateNick couldnt get the member document', {user: discord_id, error: e.message});
      });
  },

  //Set the nick of all users to their mc_ign
  updateAllNicks() {
    memberFactory.getAllWhitelisted()
      .then((members: Member[]) => {
        members.forEach(doc => update.updateNick(doc.getDiscordId()));
      })
      .catch((e: Error) => {
        global.g.log(2, 'workers', 'discord_helpers.updateAllNicks couldnt get the member database entries', {error: e});
      });
  },

  //This gets the current username of all users and writes them into the db
  async updateAllDiscordNicks() {
    const members = await memberFactory.getAllWhitelisted();
    members.forEach(async member => {
      try {
        const discordNick = await helpers.getNicknameByID(member.getDiscordId());
        member.setDiscordUserName(discordNick);
        await member.save();
      } catch (e) {
        global.g.log(2, 'workers', 'user.updateNick couldnt proceses user', {err: e.message, member: member.data})
      }
    });
  }
}

export = update;