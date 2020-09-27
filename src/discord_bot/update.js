
//Dependencies
const discord_api = require('../discord_api');
const helpers = require('./helpers.js');
const MemberFactory = require('../user/memberFactory.js');
const memberFactory = new MemberFactory();
memberFactory.connect();

let client;
emitter.on('discord_bot_ready', (_client) => {
  client = _client;
});

let update = {};
//Set the nick of a user to their mc_ign
update.updateNick = function (discord_id) {
  if(discord_id == client.guilds.get(config.discord_bot.guild).ownerID) return; //Dont update the owner of the guild, this will fail
  memberFactory.getByDiscordId(discord_id)
  .then(member => {
    let ign = typeof doc.mcName == 'string' ? member.getMcIgn() : '';
    //Get the members object
    helpers.getMemberObjectByID(discord_id, function (discordMember) {
      if(discordMember) {
        //Now its time to change the users nick
        discordMember.setNickname(ign)
          .catch(e => {global.log(2, 'discord_bot', 'discord_helpers.updateNick failed to set the members nickname', {user: discord_id, err: e});});
      } else {
        global.log(2, 'discord_bot', 'discord_helpers.updateNick couldnt get the member object', {user: discord_id, discordMember: discordMember});
      }
    });
  })
  .catch(e => {
    global.log(2, 'discord_bot', 'discord_helpers.updateNick couldnt get the member document', {user: discord_id, error: e});
  });
};

//Set the nick of all users to their mc_ign
update.updateAllNicks = function () {
  memberFactory.getAllWhitelisted()
  .then(members => {
    members.forEach(doc => update.updateNick(doc.getDiscordId()));
  })
  .catch(e => {
    global.log(2, 'discord_bot', 'discord_helpers.updateAllNicks couldnt get the member database entries', {error: e});
  });
};

//This gets the current username of all users and writes them into the db
update.updateAllDiscordNicks = function () {
  //Get all users
  memberFactory.getAllWhitelisted()
  .then(members => {
    members.forEach(member => {
      //Update discord nick
      helpers.getNicknameByID(member.getDiscordId(), function (discord_nick) {
        if(discord_nick) {
          member.setDiscordNick(discord_nick);
          member.save()
          .catch(e => global.log(2, 'user', 'user.updateNick couldnt update user', {err: e, member: member}));
        }
      });
    });
  })
  .catch(e => {
    global.log(2, 'user', 'user.updateNicks cant get any users', {err: e});
  });
};

update.updateUserIdCache = function () {
  //Get all discord Ids
  memberFactory.getAllWhitelisted()
  .then(members => {
    //Update the cache for each user
    i = 0;
    members.forEach((member) => {
      i = i + 1000;
      setTimeout(function () {
        discord_api.getUserObjectByIdFromApi(member.getDiscordId(), function (userObject) {
          global.cache.discordUserObjects[userObject.id] = userObject;
        });
      }, i);
    });
  })
  .catch(e => {
    global.log(2, 'user', 'user.updateUserIdCache cant get any users', {err: e});
  });
};

module.exports = update;