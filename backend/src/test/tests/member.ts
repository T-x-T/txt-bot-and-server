import Member = require("../../user/member.js");
import MemberFactory = require("../../user/memberFactory.js");
import Mongo = require("../../persistance/mongo.js");
import assert = require("assert");
const schema = Member.schema;

const memberFactory = new MemberFactory();

let config: IConfig;

export = (_config: IConfig) => {
  config = _config;
}

const audit1: IModLogEntry = {
  timestamp: new Date(),
  text: "audit1",
  staffDiscordId: "293029505457586176"
}
const audit2: IModLogEntry = {
  timestamp: new Date(),
  text: "audit2",
  staffDiscordId: "293029505457586176"
}
const audit3: IModLogEntry = {
  timestamp: new Date(),
  text: "audit3",
  staffDiscordId: "293029505457586176"
}

async function createAndSaveNewMember(){
  let memberFactory = new MemberFactory();
  await memberFactory.connect();
  let member = await memberFactory.create("293029505457586176", "TxT#0001", "dac25e44d1024f3b819978ed62d209a1", "The__TxT", "germany", 7, 2000, true, true, 1, "this is a test note", [audit1, audit2]);
  return member;
}

async function createAndSaveNewPrivateMember() {
  let memberFactory = new MemberFactory();
  await memberFactory.connect();
  let member = await memberFactory.create("293029505457586176", "TxT#0001", "dac25e44d1024f3b819978ed62d209a1", "The__TxT", "germany", 7, 2000, false, false, 1, "this is a test note", [audit1, audit2]);
  return member;
}

beforeEach("clear member collection", async function(){
  const con = new Mongo("members", schema);
  await con.connect();
  await con.deleteAll();
});

describe("member", function(){
  describe("instanciation", function(){
    it("instanciating shouldnt reject", async function(){
      await assert.doesNotReject(async () => await createAndSaveNewMember());
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

    it("getDiscordUserName", async function () {
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getDiscordUserName(), "TxT#0001");
    });

    it("getMcUuid should return correct UUID", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
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
      assert.strictEqual(member.getAge(), 22);
    });

    it("getAge should return correct age when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.strictEqual(member.getAge(), 22);
    });

    it("getAgeConsiderPrivacy should return correct age when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.strictEqual(member.getAgeConsiderPrivacy(), 22);
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

    it("getNotes", async function() {
      const member = await createAndSaveNewMember();
      const notes = member.getNotes();
      assert.strictEqual(notes, "this is a test note");
    });
  });

  describe("basic setters", function(){
    it("setMcIgn", async function(){
      let member = await createAndSaveNewMember();
      member.setMcIgn("testname");
      assert.strictEqual(member.getMcIgn(), "testname");
    });

    it("setMcUuid should not throw with valid input", async function(){
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setMcUuid("dac25e44d1024f3b819978ed62d209a1"));
    });

    it("setMcUuid should throw with dashed uuid format as input", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setMcUuid("dac25e44-d102-4f3b-8199-78ed62d209a1"), new Error("newMcUuid must be 32 characters long"));
    });

    it("setMcUuid should throw with input thats 31 long", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setMcUuid("dac25e44d1024f3b819978ed62d209a"), new Error("newMcUuid must be 32 characters long"));
    });

    it("setMcUuid should throw with input thats 33 long", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setMcUuid("dac25e44d1024f3b819978ed62d209axx"), new Error("newMcUuid must be 32 characters long"));
    });

    it("setCountry should not throw with correct input", async function(){
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setCountry("thisIsAValidCountry"));
    });

    it("setBirthMonth should not throw with correct input", async function(){
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setBirthMonth(2));
    });

    it("setBirthMonth should throw with 0 as input", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setBirthMonth(0), new Error("newBirthMonth must be > 0 and < 13"));
    });

    it("setBirthMonth should throw with 13 as input", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setBirthMonth(13), new Error("newBirthMonth must be > 0 and < 13"));
    });

    it("setBirthYear should not throw with correct input", async function(){
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setBirthYear(2001));
    });

    it("setPublishAge should not throw with correct input", async function(){
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setPublishAge(true));
    });

    it("setPublishCountry should not throw with correct input", async function () {
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setPublishCountry(true));
    });

    it("setNotes should set notes", async function () {
      const member = await createAndSaveNewMember();
      member.setNotes("test2");
      const notes = member.getNotes();
      assert.strictEqual(notes, "test2");
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
    });

    it("User#getDiscordUserdata should return a user object of the correct user", async function () {
      let member = await createAndSaveNewMember();
      let userData: IDiscordApiUserObject = await member.getDiscordUserdata();
      assert.strictEqual(userData.id, member.data.discord)
    });
  });

  describe("setDiscordUserName", function () {
    it("passing a correct nickname should not throw", async function () {
      let member = await createAndSaveNewMember();
      assert.doesNotThrow(() => member.setDiscordUserName("TheTxt#1234"));
    });

    it("passing a correct nickname should save input", async function () {
      let member = await createAndSaveNewMember();
      member.setDiscordUserName("TheTxt#1234");
      assert.strictEqual(member.data.discord_nick, "TheTxt#1234")
    });

    it("passing nick without # should throw", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setDiscordUserName("TheTxt1234"), new Error("no # in new nick"));
    });

    it("passing nick without discriminator should throw", async function () {
      let member = await createAndSaveNewMember();
      assert.throws(() => member.setDiscordUserName("TheTxt#"), new Error("no discriminator"));
    });

    it("passing an incorrect nickname should not save input", async function () {
      let member = await createAndSaveNewMember();
      try {
        member.setDiscordUserName("TheTxt1234");
      } catch(e) {}
      assert.notStrictEqual(member.data.discord_nick, "TheTxt#1234");
    });
  });

  describe("status", function () {
    async function createAndSaveNewMemberWithStatus(status: number) {
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
  });

  describe("modLog", function() {
    it("getModLog", async function () {
      const member = await createAndSaveNewMember();
      const modLog = member.getModLog();
      assert.deepStrictEqual(modLog[0], audit1);
      assert.deepStrictEqual(modLog[1], audit2);
    });

    it("getModLog should correctly add modLogEntry", async function() {
      const member = await createAndSaveNewMember();
      member.addModLog(audit3);
      const modLog = member.getModLog();
      assert.deepStrictEqual(modLog[2], audit3);
    });

    it("getModLog should get properly saved", async function() {
      const member = await createAndSaveNewMember();
      member.addModLog(audit3);
      await member.save();
      const loadedMember = await memberFactory.getByDiscordId("293029505457586176");
      const modLog = loadedMember.getModLog();
      assert.deepStrictEqual(modLog[2], audit3);
    });
  });

  describe("factory getters", function(){
    it("getByDiscordId should retrieve correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByDiscordId("293029505457586176");
      assert.strictEqual(member.getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getByDiscordId should create a correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByDiscordId("293029505457586176");
      assert.strictEqual(member.getDiscordUserName(), "TxT#0001");
      assert.strictEqual(member.getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
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

    it("getByMcUuid should create a correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(member.getDiscordUserName(), "TxT#0001");
      assert.strictEqual(member.getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
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
      assert.strictEqual(members[0].getDiscordUserName(), "TxT#0001");
      assert.strictEqual(members[0].getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
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
      let member = members.find((m: Member) => m.getDiscordId() === "385133822762811394");
      assert.strictEqual(member.getDiscordUserName(), "Mufon#7787");
      assert.strictEqual(member.getMcUuid(), "28fc533e641f440fbe3a9bb0f8c5bed6");
      assert.strictEqual(member.getMcIgn(), "Mufon59");
      assert.strictEqual(member.getCountry(), "germany");
      assert.strictEqual(member.getBirthMonth(), 7);
      assert.strictEqual(member.getBirthYear(), 2000);
      assert.strictEqual(member.getPrivacySettings().publish_country, true);
      assert.strictEqual(member.getPrivacySettings().publish_age, true);
    });

    it("getAllWhitelisted should only return members with status 1", async function(){
      let m1 = await createAndSaveNewMember();
      let m2 = await memberFactory.create("243874567867596800", "MrSprouse#0001", "4fe6104dec5e4c8db78ebe3fe1ac36f8", "MrSprouse", "germany", 7, 2000, true, true, 1);
      await memberFactory.create("385133822762811394", "Mufon#7787", "28fc533e641f440fbe3a9bb0f8c5bed6", "Mufon59", "germany", 7, 2000, true, true, 1);
      await memberFactory.create("455808529627086848", "PyroChicken#3588", "e31a7dbd39cb42658c751958c6c200d1", "PyroChicken99", "germany", 7, 2000, true, true, 1);
      m1.setStatus(0);
      await m1.save();
      m2.setStatus(0);
      await m2.save();

      let res = await memberFactory.getAllWhitelisted();
      assert.strictEqual(res.length, 2);

      let member = res.find((m: Member) => m.getDiscordId() === "385133822762811394");
      assert.strictEqual(member.getDiscordUserName(), "Mufon#7787");
      assert.strictEqual(member.getMcUuid(), "28fc533e641f440fbe3a9bb0f8c5bed6");
      assert.strictEqual(member.getMcIgn(), "Mufon59");
      assert.strictEqual(member.getCountry(), "germany");
      assert.strictEqual(member.getBirthMonth(), 7);
      assert.strictEqual(member.getBirthYear(), 2000);
      assert.strictEqual(member.getPrivacySettings().publish_country, true);
      assert.strictEqual(member.getPrivacySettings().publish_age, true);
    });
  });

  describe("giving and taking discord roles", function(){
    it("calling giveDiscordRole should not reject", async function(){
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.giveDiscordRole(config.discord_bot.roles.inactive));
    });

    it("calling takeDiscordRole should not reject", async function(){
      let member = await createAndSaveNewMember();
      await assert.doesNotReject(async () => await member.takeDiscordRole(config.discord_bot.roles.inactive));
    });
  });

  describe("inactivate", function(){
    it("inactivate should set status to 2", async function () {
      let member = await createAndSaveNewMember();
      await member.inactivate();
      assert.strictEqual(member.getStatus(), 2);
    });

    it("inactivate should take paxterya role away", async function () {
      global.g.emitter.once("testing_discordHelpers_removeMemberFromRole", (discordId: string, roleId: string) => {
        assert.strictEqual(discordId, member.getDiscordId());
        assert.strictEqual(roleId, config.discord_bot.roles.paxterya);
      });

      let member = await createAndSaveNewMember();
      await member.inactivate();
    });

    it("inactivate should give inactive role", async function () {
      global.g.emitter.once("testing_discordHelpers_addMemberToRole", (discordId: string, roleId: string) => {
        assert.strictEqual(discordId, member.getDiscordId());
        assert.strictEqual(roleId, config.discord_bot.roles.inactive);
      });

      let member = await createAndSaveNewMember();
      await member.inactivate();
    });

    it("inactivate should send whitelist remove command per rcon", async function(){
      let member = await createAndSaveNewMember();
      
      global.g.emitter.once("testing_minecraft_rcon_send", (cmd: string) => {
        assert.strictEqual(cmd, "whitelist remove The__TxT");
      });

      await member.inactivate();
    });
  });

  describe("activate", function(){
    it("activate should set status to 1", async function () {
      let member = await createAndSaveNewMember();
      await member.activate();
      assert.strictEqual(member.getStatus(), 1);
    });

    it("activate should take inactive role away", async function () {
      global.g.emitter.once("testing_discordHelpers_removeMemberFromRole", (discordId: string, roleId: string) => {
        assert.strictEqual(discordId, member.getDiscordId());
        assert.strictEqual(roleId, config.discord_bot.roles.inactive);
      });

      let member = await createAndSaveNewMember();
      await member.activate();
    });

    it("activate should give paxterya role", async function () {
      global.g.emitter.once("testing_discordHelpers_addMemberToRole", (discordId: string, roleId: string) => {
        assert.strictEqual(discordId, member.getDiscordId());
        assert.strictEqual(roleId, config.discord_bot.roles.paxterya);
      });

      let member = await createAndSaveNewMember();
      await member.activate();
    });

    it("activate should send whitelist add command per rcon", async function () {
      let member = await createAndSaveNewMember();

      global.g.emitter.once("testing_minecraft_rcon_send", (cmd: string) => {
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
      
      await member.delete();

      entries = await con.retrieveAll();
      assert.strictEqual(entries.length, 0);
    });
  });

  describe("ban", function(){
    it("ban should bans member from discord", async function(){
      let member = await createAndSaveNewMember();
      
      global.g.emitter.once("testing_discordhelpers_ban", (discordId: string) => {
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

      await member.ban();

      entries = await con.retrieveAll();
      assert.strictEqual(entries.length, 0);
    });

    it("ban should send whitelist remove and ban command per rcon", async function(){
      let member = await createAndSaveNewMember();
      let count = 0;
      global.g.emitter.on("testing_minecraft_rcon_send", (cmd: string) => {
        if (count === 0) assert.strictEqual(cmd, "whitelist remove The__TxT");
        if (count === 1) {
          assert.strictEqual(cmd, "ban The__TxT");
          global.g.emitter.removeAllListeners("testing_minecraft_rcon_send");
        }
        count = 1;
      });

      await member.ban();
    });
  });

  describe("banInGame", function() {
    it("banInGame should send ban command per rcon", async function () {
      const member = await createAndSaveNewMember();
      global.g.emitter.once("testing_minecraft_rcon_send", (cmd: string) => {
        assert.strictEqual(cmd, "ban The__TxT");
      });

      await member.banInGame();
    });
  });

  describe("pardonInGame", function() {
    it("banInGame should send ban command per rcon", async function () {
      const member = await createAndSaveNewMember();
      global.g.emitter.once("testing_minecraft_rcon_send", (cmd: string) => {
        assert.strictEqual(cmd, "pardon The__TxT");
      });

      await member.pardonInGame();
    });
  });
});