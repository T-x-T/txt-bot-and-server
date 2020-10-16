require("./test.js");
const assert = require("assert");
const Application = require("../src/application/application.js");
const ApplicationFactory = require("../src/application/applicationFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const Member = require("../src/user/member.js");
const MemberFactory = require("../src/user/memberFactory.js");
const memberFactory = new MemberFactory();
const discord_helpers = require("../src/discord_bot");

async function createAndSaveApplication(){
  let applicationFactory = new ApplicationFactory();
  await applicationFactory.connect();
  let application = await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", true, true, true, "TxT#0001", "The__TxT");
  return application;
}

describe("application", function(){
  beforeEach("clear application collection", async function () {
    const con = new Mongo("application", Application.schema);
    await con.connect();
    await con.deleteAll();
  });


  describe("initialize", function(){
    it("using factory to create new object should not reject", async function(){
      await assert.doesNotReject(async () => await createAndSaveApplication());
    });

    it("using factory to create new object should return an instance of Application", async function(){
      let application = await createAndSaveApplication();
      assert.ok(application instanceof Application);
    });
  });

  describe("getters", function(){
    it("getId should return 0", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getId(), 0);
    });

    it("getTimestamp should return an instanceof Date", async function(){
      let application = await createAndSaveApplication();
      assert.ok(application.getTimestamp() instanceof Date);
    });

    it("getTimestamp should return a date with the same day as today", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getTimestamp().getDay(), new Date().getDay());
    });

    it("getDiscordId should return the correct value", async function () {
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getDiscordId(), "293029505457586176");
    });

    it("getMcUuid should return the correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getEmailAddress should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getEmailAddress(), "test@test.com");
    });

    it("getCountry should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getCountry(), "germany");
    });

    it("getBirthMonth should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getBirthMonth(), 7);
    });

    it("getBirthYear should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getBirthYear(), 2000);
    });

    it("getAge should return correct age", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getAge(), 20);
    });

    it("getAboutMe should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getAboutMe(), "this is the about me text");
    });

    it("getMotivation should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getMotivation(), "this is my motivation");
    });

    it("getBuildImages should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getBuildImages(), "nice image");
    });

    it("getPublishAboutMe should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getPublishAboutMe(), true);
    });

    it("getPublishAge should return correct value", async function () {
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getPublishAge(), true);
    });

    it("getPublishCountry should return correct value", async function () {
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getPublishCountry(), true);
    });

    it("getDiscordUserName should return correct value", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getDiscordUserName(), "TxT#0001");
    });

    it("getMcIgn should return correct value", async function () {
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getMcIgn(), "The__TxT");
    });

    it("getStatus should return 1", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getStatus(), 1);
    });

    it("getDenyReason should return correct value after application has been denied", async function(){
      let application = await createAndSaveApplication();
      application.deny("deny reason");
      assert.strictEqual(application.getDenyReason(), "deny reason");
    });
  });

  describe("setters", function(){
    it("setDiscordUserName should correctly set value", async function(){
      let application = await createAndSaveApplication();
      application.setDiscordUserName("testUser");
      assert.strictEqual(application.getDiscordUserName(), "testUser");
    });

    it("setMcIgn should correctly set value", async function () {
      let application = await createAndSaveApplication();
      application.setMcIgn("testUser");
      assert.strictEqual(application.getMcIgn(), "testUser");
    });

    it("setStatus should correctly set status 1", async function(){
      let application = await createAndSaveApplication();
      application.setStatus(1);
      assert.strictEqual(application.getStatus(), 1);
    });

    it("setStatus should correctly set status 3", async function () {
      let application = await createAndSaveApplication();
      application.setStatus(3);
      assert.strictEqual(application.getStatus(), 3);
    });

    it("setStatus should throw when trying to set status 0", async function(){
      let application = await createAndSaveApplication();
      assert.throws(() => application.setStatus(0), new Error("status must be between 1 and 3"));
    });

    it("setStatus should throw when trying to set status 4", async function () {
      let application = await createAndSaveApplication();
      assert.throws(() => application.setStatus(4), new Error("status must be between 1 and 3"));
    });
  });

  describe("deny", function(){
    it("set status to 2", async function(){
      let application = await createAndSaveApplication();
      await application.deny("reason");
      assert.strictEqual(application.getStatus(), 2);
    });

    it("set given deny reason", async function () {
      let application = await createAndSaveApplication();
      await application.deny("reason");
      assert.strictEqual(application.getDenyReason(), "reason");
    });

    it("send denied mail", async function(){
      emitter.once("testing_email_sendApplicationDeniedMail", application => {
        assert.strictEqual(application.getId(), 0);
      });
      
      let application = await createAndSaveApplication();
      await application.deny("reason");
    });
  });

  describe("accept", function(){
    afterEach("clear member collection", async function () {
      const con = new Mongo("member", Member.schema);
      await con.connect();
      await con.deleteAll();
    });

    it("set status to 3", async function(){
      let application = await createAndSaveApplication();
      await application.accept();
      assert.strictEqual(application.getStatus(), 3);
    });

    it("send accepted mail", async function(){
      emitter.once("testing_email_sendApplicationAcceptedMail", application => {
        assert.strictEqual(application.getId(), 0);
      });

      let application = await createAndSaveApplication();
      await application.accept();
    });

    it("create a member from the application", async function(){
      let application = await createAndSaveApplication();
      await application.accept();

      let member = await memberFactory.getByDiscordId("293029505457586176");
      assert.ok(member);
    });

    it("dont create a member from the application if the discord user is not in the guild", async function(){
      let applicationFactory = new ApplicationFactory();
      await applicationFactory.connect();
      let application = await applicationFactory.create("214884802749399041", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", true, true, true, "NotTxT#0001", "The__TxT");
      await application.accept();
      let member = await memberFactory.getByDiscordId("214884802749399041");
      assert.ok(!member);
    });

    it("create a member from the application that has correct data", async function(){
      let application = await createAndSaveApplication();
      await application.accept();
      let member = await memberFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(application.getDiscordId(), member.getDiscordId());
      assert.strictEqual(application.getMcUuid(), member.getMcUuid());
      assert.strictEqual(application.getCountry(), member.getCountry());
      assert.strictEqual(application.getBirthMonth(), member.getBirthMonth());
      assert.strictEqual(application.getBirthYear(), member.getBirthYear());
      assert.strictEqual(application.getAge(), member.getAge());
      assert.strictEqual(application.getPublishAge(), member.getPrivacySettings().publish_age);
      assert.strictEqual(application.getPublishCountry(), member.getPrivacySettings().publish_country);
      assert.strictEqual(application.getDiscordUserName(), member.getDiscordUserName());
      assert.strictEqual(application.getMcIgn(), member.getMcIgn());
    });

    it("fill out existing member", async function(){
      let application = await createAndSaveApplication();
      await memberFactory.create("293029505457586176");
      await application.accept();
      let allMembers = await memberFactory.getAll();
      assert.strictEqual(allMembers.length, 1);
    });

    it("correctly fill out existing member", async function(){
      let application = await createAndSaveApplication();
      await memberFactory.create("293029505457586176");
      await application.accept();
      let member = await memberFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(application.getDiscordId(), member.getDiscordId());
      assert.strictEqual(application.getMcUuid(), member.getMcUuid());
      assert.strictEqual(application.getCountry(), member.getCountry());
      assert.strictEqual(application.getBirthMonth(), member.getBirthMonth());
      assert.strictEqual(application.getBirthYear(), member.getBirthYear());
      assert.strictEqual(application.getAge(), member.getAge());
      assert.strictEqual(application.getPublishAge(), member.getPrivacySettings().publish_age);
      assert.strictEqual(application.getPublishCountry(), member.getPrivacySettings().publish_country);
      assert.strictEqual(application.getDiscordUserName(), member.getDiscordUserName());
      assert.strictEqual(application.getMcIgn(), member.getMcIgn());
    });

    it("create member with status 1", async function(){
      let application = await createAndSaveApplication();
      await application.accept();
      let member = await memberFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(member.getStatus(), 1);
    });

    it("send welcome message", async function(){
      emitter.once("testing_discordHelpers_sendMessage", (message, channelId) => {
        assert.ok(message.includes("293029505457586176"));
        assert.strictEqual(channelId, config.discord_bot.channel.new_member_announcement);
      });

      let application = await createAndSaveApplication();
      await application.save();
    });

    it("add member to whitelist", async function(){
      emitter.once("testing_minecraft_rcon_send", cmd => {
        assert.strictEqual(cmd, "whitelist add The__TxT");
      });

      let application = await createAndSaveApplication();
      await application.accept();
    });

    it("add member to paxterya role", async function(){
      let application = await createAndSaveApplication();
      
      emitter.once("testing_discordHelpers_addMemberToRole", (discordId, roleId) => {
        assert.strictEqual(discordId, application.getDiscordId());
        assert.strictEqual(roleId, config.discord_bot.roles.paxterya);
      });

      await application.accept();
    });

    it("set correct nickname in discord", async function(){
      discord_helpers.getMemberObjectById("293029505457586176", async discordMember => {
        discordMember.setNickname("test");
        let application = await createAndSaveApplication();
        await application.accept();
        discord_helpers.getMemberObjectById("293029505457586176", discordMember => {
          assert.strictEqual(discordMember.nickname, "The__TxT");
        });
      });
    });
  });
});