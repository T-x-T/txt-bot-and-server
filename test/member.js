require("./test.js");
const Member = require("../src/user/member.js");
const MemberFactory = require("../src/user/memberFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const assert = require("assert");
const schema = Member.schema;
const discord_helpers = require("../src/discord_bot");
const {assets} = require("../src/web/handlers.js");

async function createAndSaveNewMember(){
  let memberFactory = new MemberFactory();
  await memberFactory.connect();
  let member = await memberFactory.create("293029505457586176", "TxT#0001", "dac25e44d1024f3b819978ed62d209a1", "The__TxT", "germany", 7, 2000, true, true);
  return member;
}

async function createAndSaveNewPrivateMember() {
  let memberFactory = new MemberFactory();
  await memberFactory.connect();
  let member = await memberFactory.create("293029505457586176", "TxT#0001", "dac25e44d1024f3b819978ed62d209a1", "The__TxT", "germany", 7, 2000, false, false);
  return member;
}

beforeEach("clear member collection", async function(){
  const con = new Mongo("members", schema);
  await con.connect();
  await con.deleteAll();
});

describe("member", function(){
  this.timeout(5000);
  describe("instanciation", function(){
    it("instanciating shouldnt reject", async function(){
      await assert.doesNotReject(async () => await createAndSaveNewMember());
    });
  });

  describe("updateMcIgn", function(){
    it("updateMcIgn shouldnt reject", async function(){
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.updateMcIgn());
    });

    it("updateMcIgn should set correct McIgn", async function(){
      let member = await createAndSaveNewMember();
      await member.updateMcIgn();
      assert.strictEqual(member.data.mcName, "The__TxT");
    });

    it("updateMcIgn should resolve with correct McIgn", async function () {
      let member = await createAndSaveNewMember();
      let ign = await member.updateMcIgn();
      assert.strictEqual(ign, "The__TxT");
    });
  });

  describe("basic getters", function(){
    it("calling User#getJoinedDate should return a date", async function () {
      let member = await createAndSaveNewMember();
      assert.ok(member.getJoinedDate() instanceof Date);
    });

    it("getMcSkinUrl should return a url containing the uuid", async function () {
      let member = await createAndSaveNewMember();
      let url = member.getMcSkinUrl();
      assert.ok(url.includes(member.data.mcUUID));
    });

    it("getDiscordId", async function () {
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getDiscordId(), "293029505457586176");
    });

    it("getDiscordNick", async function () {
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getDiscordNick(), "TxT#0001");
    });

    it("getMcUUID should return correct UUID", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getMcIgn should return correct IGN", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getMcIgn(), "The__TxT");
    });

    it("getCountry should return correct country when publish_country is true", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getCountry(), "germany");
    });

    it("getCountry should return correct country when publish_country is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getCountry(), "germany");
    });

    it("getCountryConsiderPrivacy should return correct country when publish_country is true", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getCountryConsiderPrivacy(), "germany");
    });

    it("getCountryConsiderPrivacy should return false when publish_country is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getCountryConsiderPrivacy(), false);
    });

    it("getBirthMonth should return correct month of birth (starting at 1 for jan) when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getBirthMonth(), 7);
    });

    it("getBirthMonth should return correct month of birth (starting at 1 for jan) when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getBirthMonth(), 7);
    });

    it("getBirthYear should return correct year of birth when publish_age is true", async function () {
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getBirthYear(), 2000);
    });

    it("getBirthYear should return correct year of birth when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getBirthYear(), 2000);
    });

    it("getAge should return correct age when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getAge(), 20);
    });

    it("getAge should return correct age when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getAge(), 20);
    });

    it("getAgeConsiderPrivacy should return correct age when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getAgeConsiderPrivacy(), 20);
    });

    it("getAgeConsiderPrivacy should return false when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getAgeConsiderPrivacy(), false);
    });

    it("getPrivacySettings should return correct privacy settings object", async function(){
      let member = await createAndSaveNewMember();
      let privacy = member.getPrivacySettings();
      assert.ok(privacy.publish_country);
      assert.ok(privacy.publish_age);
    });
  });

  describe("basic setters", function(){
    it("setMcIgn", async function(){
      let member = await createAndSaveNewMember();
      member.setMcIgn("testname");
      assert.strictEqual(member.getMcIgn(), "testname");
    });
  });

  describe("karma", function () {
    it("get karma should return 0 when karma hasnt been modified", async function () {
      let member = await createAndSaveNewMember();
      let karma = await member.getKarma();
      assert.strictEqual(karma, 0);
    });

    it("adding 1 karma shouldnt reject and save correct value", async function () {
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.modifyKarmaBy(1));
      let karma = await member.getKarma();
      assert.strictEqual(karma, 1);
    });

    it("adding 10 karma shouldnt reject", async function () {
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.modifyKarmaBy(10));
      let karma = await member.getKarma();
      assert.strictEqual(karma, 10);
    });

    it("subtracting 1 karma shouldnt reject and save correct value", async function () {
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.modifyKarmaBy(-1));
      let karma = await member.getKarma();
      assert.strictEqual(karma, -1);
    });

    it("adding 0 karma shouldnt reject and save correct value", async function () {
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.modifyKarmaBy(0));
      let karma = await member.getKarma();
      assert.strictEqual(karma, 0);
    });
  });

  describe("get discord avatar URL", function () {
    it("calling User#getDiscordAvatarUrl does not reject", async function () {
      let member = await createAndSaveNewMember();
      assert.doesNotReject(async () => await member.getDiscordAvatarUrl());
    });

    it("calling User#getDiscordAvatarUrl returns a string", async function () {
      let member = await createAndSaveNewMember();
      let avatarUrl = await member.getDiscordAvatarUrl();
      assert.strictEqual(typeof avatarUrl, "string");
    });

    it("calling User#getDiscordAvatarUrl returns a url", async function () {
      let member = await createAndSaveNewMember();
      let avatarUrl = await member.getDiscordAvatarUrl();
      assert.doesNotThrow(() => new URL(avatarUrl));
    });
  });

  describe("get user object", function () {
    if(!global.hasOwnProperty("cache")) global.cache = {};
    global.cache.discordUserObjects = {};

    it("calling User#getDiscordUserdata shouldnt reject", async function () {
      let user = await createAndSaveNewMember();
      await assert.doesNotReject(async () => user.getDiscordUserdata());
    });

    it("User#getDiscordUserdata should return a valid discord user object", async function () {
      let member = await createAndSaveNewMember();
      let userData = await member.getDiscordUserdata();

      assert.ok(userData.hasOwnProperty("id"));
      assert.ok(userData.hasOwnProperty("username"));
      assert.ok(userData.hasOwnProperty("discriminator"));
      assert.ok(userData.hasOwnProperty("public_flags"));
    });

    it("User#getDiscordUserdata should return a user object of the correct user", async function () {
      let member = await createAndSaveNewMember();
      let userData = await member.getDiscordUserdata();
      assert.strictEqual(userData.id, member.data.discord)
    });
  });

  describe("setDiscordNick", function () {
    it("passing a correct nickname should not throw", async function () {
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setDiscordNick("TheTxt#1234"));
    });

    it("passing a correct nickname should save input", async function () {
      let member = await createAndSaveNewMember();
      member.setDiscordNick("TheTxt#1234");
      assert.strictEqual(member.data.discord_nick, "TheTxt#1234")
    });

    it("passing nothing should throw", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setDiscordNick(), new Error("no input given"));
    });

    it("passing nick without # should throw", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setDiscordNick("TheTxt1234"), new Error("no # in new nick"));
    });

    it("passing nick without discriminator should throw", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setDiscordNick("TheTxt#"), new Error("no discriminator"));
    });

    it("passing an incorrect nickname should not save input", async function () {
      let member = await createAndSaveNewMember();
      try {
        member.setDiscordNick("TheTxt1234");
      } catch(e) {}
      assert.notStrictEqual(member.data.discord_nick, "TheTxt#1234");
    });
  });

  describe("status", function () {
    async function createAndSaveNewMemberWithStatus(status) {
      let memberFactory = new MemberFactory();
      await memberFactory.connect();
      let member = await memberFactory.create("293029505457586176", "TxT#0001", "dac25e44d1024f3b819978ed62d209a1", "The__TxT", "germany", 7, 2000, true, true, status);
      return member;
    }

    it("createAndSaveNewUser should create user with status 1", async function () {
      let member = await createAndSaveNewMember();
      assert.strictEqual(1, member.getStatus());
    });

    it("creating new user with status 0 should get saved correctly", async function () {
      let member = await createAndSaveNewMemberWithStatus(0);
      assert.strictEqual(0, member.getStatus());
    });

    it("creating new user with status 1 should get saved correctly", async function () {
      let member = await createAndSaveNewMemberWithStatus(1);
      assert.strictEqual(1, member.getStatus());
    });

    it("creating new user with status 2 should get saved correctly", async function () {
      let member = await createAndSaveNewMemberWithStatus(2);
      assert.strictEqual(2, member.getStatus());
    });

    it("creating new user with status -1 should result in user with status 0", async function () {
      let member = await createAndSaveNewMemberWithStatus(-1);
      assert.strictEqual(0, member.getStatus());
    });

    it("creating new user with status 3 should result in user with status 0", async function () {
      let member = await createAndSaveNewMemberWithStatus(3);
      assert.strictEqual(0, member.getStatus());
    });

    it("setting status to 0 should correctly set status", async function () {
      let member = await createAndSaveNewMemberWithStatus(1);
      member.setStatus(0);
      assert.strictEqual(0, member.getStatus());
    });

    it("setting status to 2 should correctly set status", async function () {
      let member = await createAndSaveNewMemberWithStatus(1);
      member.setStatus(2);
      assert.strictEqual(2, member.getStatus());
    });

    it("setting status to -1 should throw", async function () {
      let member = await createAndSaveNewMemberWithStatus(1);
      assert.throws(() => member.setStatus(-1), new Error("value -1 is not a valid status"));
    });

    it("setting status to 3 should throw", async function () {
      let member = await createAndSaveNewMemberWithStatus(1);
      assert.throws(() => member.setStatus(3), new Error("value 3 is not a valid status"));
    });
  });

  describe("factory getters", function(){
    it("getByDiscordId should retrieve correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByDiscordId("293029505457586176");
      assert.strictEqual(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getByDiscordId should reject when no discord_id is given", async function () {
      await assert.rejects(async () => await new MemberFactory().getByDiscordId(), new Error("No discord_id given"));
    });

    it("getByDiscordId should create a correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByDiscordId("293029505457586176");
      assert.strictEqual(member.getDiscordNick(), "TxT#0001");
      assert.strictEqual(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(member.getMcIgn(), "The__TxT");
      assert.strictEqual(member.getCountry(), "germany");
      assert.strictEqual(member.getBirthMonth(), 7);
      assert.strictEqual(member.getBirthYear(), 2000);
      assert.strictEqual(member.getPrivacySettings().publish_country, true);
      assert.strictEqual(member.getPrivacySettings().publish_age, true);
    });

    it("getByMcUuid should retrieve correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(member.getDiscordId(), "293029505457586176");
    });

    it("getByMcUuid should reject when no mc_uuid is given", async function(){
      await assert.rejects(async () => new MemberFactory().getByMcUuid(), new Error("No mc_uuid given"));
    });

    it("getByMcUuid should create a correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(member.getDiscordNick(), "TxT#0001");
      assert.strictEqual(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(member.getMcIgn(), "The__TxT");
      assert.strictEqual(member.getCountry(), "germany");
      assert.strictEqual(member.getBirthMonth(), 7);
      assert.strictEqual(member.getBirthYear(), 2000);
      assert.strictEqual(member.getPrivacySettings().publish_country, true);
      assert.strictEqual(member.getPrivacySettings().publish_age, true);
    });

    it("get all with one member in the db should return an array with a length of one", async function(){
      await createAndSaveNewMember();
      let members = await new MemberFactory().getAll();
      assert.strictEqual(members.length, 1);
    });

    it("get all with one member in the db should return a valid member object", async function () {
      await createAndSaveNewMember();
      let members = await new MemberFactory().getAll();
      assert.strictEqual(members[0].getDiscordNick(), "TxT#0001");
      assert.strictEqual(members[0].getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(members[0].getMcIgn(), "The__TxT");
      assert.strictEqual(members[0].getCountry(), "germany");
      assert.strictEqual(members[0].getBirthMonth(), 7);
      assert.strictEqual(members[0].getBirthYear(), 2000);
      assert.strictEqual(members[0].getPrivacySettings().publish_country, true);
      assert.strictEqual(members[0].getPrivacySettings().publish_age, true);
    });

    it("get all with three members in the db should return an array with a length of three", async function () {
      await createAndSaveNewMember();
      await memberFactory.create("243874567867596800", "MrSprouse#0001", "4fe6104dec5e4c8db78ebe3fe1ac36f8", "MrSprouse", "germany", 7, 2000, true, true);
      await memberFactory.create("385133822762811394", "Mufon#7787", "28fc533e641f440fbe3a9bb0f8c5bed6", "Mufon59", "germany", 7, 2000, true, true);
      let members = await new MemberFactory().getAll();
      assert.strictEqual(members.length, 3);
    });

    it("get all with three members in the db should return a valid member object", async function () {
      await createAndSaveNewMember();
      await memberFactory.create("243874567867596800", "MrSprouse#0001", "4fe6104dec5e4c8db78ebe3fe1ac36f8", "MrSprouse", "germany", 7, 2000, true, true);
      await memberFactory.create("385133822762811394", "Mufon#7787", "28fc533e641f440fbe3a9bb0f8c5bed6", "Mufon59", "germany", 7, 2000, true, true);

      let members = await new MemberFactory().getAll();
      let member = members.find(m => m.getDiscordId() === "385133822762811394");
      assert.strictEqual(member.getDiscordNick(), "Mufon#7787");
      assert.strictEqual(member.getMcUUID(), "28fc533e641f440fbe3a9bb0f8c5bed6");
      assert.strictEqual(member.getMcIgn(), "Mufon59");
      assert.strictEqual(member.getCountry(), "germany");
      assert.strictEqual(member.getBirthMonth(), 7);
      assert.strictEqual(member.getBirthYear(), 2000);
      assert.strictEqual(member.getPrivacySettings().publish_country, true);
      assert.strictEqual(member.getPrivacySettings().publish_age, true);
    });

    it("getAllWhitelisted should only return members with status 1", async function(){
      let m1 = await createAndSaveNewMember();
      let m2 = await memberFactory.create("243874567867596800", "MrSprouse#0001", "4fe6104dec5e4c8db78ebe3fe1ac36f8", "MrSprouse", "germany", 7, 2000, true, true);
      await memberFactory.create("385133822762811394", "Mufon#7787", "28fc533e641f440fbe3a9bb0f8c5bed6", "Mufon59", "germany", 7, 2000, true, true);
      await memberFactory.create("455808529627086848", "PyroChicken#3588", "e31a7dbd39cb42658c751958c6c200d1", "PyroChicken99", "germany", 7, 2000, true, true);
      m1.setStatus(0);
      await m1.save();
      m2.setStatus(0);
      await m2.save();

      let res = await memberFactory.getAllWhitelisted();
      assert.strictEqual(res.length, 2);

      let member = res.find(m => m.getDiscordId() === "385133822762811394");
      assert.strictEqual(member.getDiscordNick(), "Mufon#7787");
      assert.strictEqual(member.getMcUUID(), "28fc533e641f440fbe3a9bb0f8c5bed6");
      assert.strictEqual(member.getMcIgn(), "Mufon59");
      assert.strictEqual(member.getCountry(), "germany");
      assert.strictEqual(member.getBirthMonth(), 7);
      assert.strictEqual(member.getBirthYear(), 2000);
      assert.strictEqual(member.getPrivacySettings().publish_country, true);
      assert.strictEqual(member.getPrivacySettings().publish_age, true);
    });
  });

  describe("giving and taking discord roles", function(){
    this.timeout(10000);
    it("calling giveDiscordRole should not reject", async function(){
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.giveDiscordRole(config.discord_bot.roles.inactive));
    });

    it("calling takeDiscordRole should not reject", async function(){
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.takeDiscordRole(config.discord_bot.roles.inactive));
    });

    it("member should have role after calling giveDiscordRole", async function(){
      let member = await createAndSaveNewMember();
      await member.giveDiscordRole(config.discord_bot.roles.inactive);
      assert.ok(discord_helpers.hasRole("293029505457586176", config.discord_bot.roles.inactive));
    });

    it("member should not have role after calling takeDiscordRole", async function () {
      let member = await createAndSaveNewMember();
      await member.takeDiscordRole(config.discord_bot.roles.inactive);
      assert.ok(!discord_helpers.hasRole("293029505457586176", config.discord_bot.roles.inactive));
    });
  });

  describe("inactivate", function(){
    this.timeout(10000);
    it("inactivate should set status to 2", async function () {
      let member = await createAndSaveNewMember();
      await member.inactivate();
      assert.strictEqual(member.getStatus(), 2);
    });

    it("inactivate should take paxterya role away", async function () {
      let member = await createAndSaveNewMember();
      await member.giveDiscordRole(config.discord_bot.roles.paxterya);
      await member.inactivate();
      assert.ok(!discord_helpers.hasRole("293029505457586176", config.discord_bot.roles.paxterya));
    });

    it("inactivate should give inactive role", async function () {
      let member = await createAndSaveNewMember();
      await member.takeDiscordRole(config.discord_bot.roles.inactive);
      await member.inactivate();
      assert.ok(discord_helpers.hasRole("293029505457586176", config.discord_bot.roles.inactive));
    });

    it("inactivate should send whitelist remove command per rcon", async function(){
      let member = await createAndSaveNewMember();
      
      emitter.once("testing_minecraft_rcon_send", cmd => {
        assert.strictEqual(cmd, "whitelist remove The__TxT");
      });

      await member.inactivate();
    });
  });

  describe("activate", function(){
    this.timeout(20000);
    it("activate should set status to 1", async function () {
      let member = await createAndSaveNewMember();
      await member.activate();
      assert.strictEqual(member.getStatus(), 1);
    });

    it("activate should take inactive role away", async function () {
      let member = await createAndSaveNewMember();
      await member.giveDiscordRole(config.discord_bot.roles.inactive);
      await member.activate();
      assert.ok(!discord_helpers.hasRole("293029505457586176", config.discord_bot.roles.inactive));
    });

    it("activate should give paxterya role", async function () {
      let member = await createAndSaveNewMember();
      await member.takeDiscordRole(config.discord_bot.roles.paxterya);
      await member.activate();
      assert.ok(discord_helpers.hasRole("293029505457586176", config.discord_bot.roles.paxterya));
    });

    it("activate should send whitelist add command per rcon", async function () {
      let member = await createAndSaveNewMember();

      emitter.once("testing_minecraft_rcon_send", cmd => {
        assert.strictEqual(cmd, "whitelist add The__TxT");
      });

      await member.activate();
    });
  });

  describe("delete", function(){
    it("delete actually deletes entry from db", async function(){
      const con = new Mongo("members", schema);
      await con.connect();
      
      let member = await createAndSaveNewMember();
      
      let entries = await con.retrieveAll();
      assert.strictEqual(entries.length, 1);
      
      member.delete();

      entries = await con.retrieveAll();
      assert.strictEqual(entries.length, 0);
    });
  });

  describe("ban", function(){
    it("ban should bans member from discord", async function(){
      let member = await createAndSaveNewMember();
      
      emitter.once("testing_discordhelpers_ban", discordId => {
        assert.strictEqual(discordId, member.getDiscordId());
      });

      await member.ban();
    });

    it("ban should actually delete member from db", async function () {
      const con = new Mongo("members", schema);
      await con.connect();

      let member = await createAndSaveNewMember();

      let entries = await con.retrieveAll();
      assert.strictEqual(entries.length, 1);

      member.ban();

      entries = await con.retrieveAll();
      assert.strictEqual(entries.length, 0);
    });

    it("ban should send whitelist remove and ban command per rcon", async function(){
      let member = await createAndSaveNewMember();
      let count = 0;
      emitter.on("testing_minecraft_rcon_send", cmd => {
        if (count === 0) assert.strictEqual(cmd, "whitelist remove The__TxT");
        if (count === 1) {
          assert.strictEqual(cmd, "ban The__TxT");
          emitter.removeAllListeners("testing_minecraft_rcon_send");
        }
        count = 1;
      });

      await member.ban();
    });
  });
});