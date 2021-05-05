import assert = require("assert");
import Application = require("../../application/application.js");
import ApplicationFactory = require("../../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory();
import Mongo = require("../../persistance/mongo.js");
import Member = require("../../user/member.js");
import MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory();
import discord_helpers = require("../../discord_helpers/index.js");

let config: IConfig;

export = (_config: IConfig) => {
  config = _config;
}

async function createAndSaveApplication(){
  return await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
}

describe("application", function(){
  beforeEach("clear application collection", async function () {
    const con = new Mongo("application", Application.schema);
    await con.connect();
    await con.deleteAll();
  });

  describe("create", function(){
    it("using factory to create new object should not reject", async function(){
      await assert.doesNotReject(async () => await createAndSaveApplication());
    });

    it("using factory to create new object should return an instance of Application", async function(){
      let application = await createAndSaveApplication();
      assert.ok(application instanceof Application);
    });

    it("trying to create two applications with the same discordId and mcUuid should fail", async function(){
      await createAndSaveApplication();
      await assert.rejects(async () => await createAndSaveApplication(), new Error("Applicant still has open application or got accepted already"));
    });

    it("trying to create two applications with the same discordId should fail", async function(){
      await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await assert.rejects(async () => await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT"), new Error("Applicant still has open application or got accepted already"));
    });

    it("trying to create two applications with the same mcUuid should fail", async function () {
      await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await assert.rejects(async () => await applicationFactory.create("293029505457586175", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT"), new Error("Applicant still has open application or got accepted already"));
    });

    it("trying to create a new application when the same discordId has an accepted application should fail", async function(){
      (await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).accept();
      await assert.rejects(async () => await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT"), new Error("Applicant still has open application or got accepted already"));
    });

    it("trying to create a new application when the same mcUuid has an accepted application should fail", async function () {
      (await applicationFactory.create("293029505457586175", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).accept();
      await assert.rejects(async () => await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT"), new Error("Applicant still has open application or got accepted already"));
    });

    it("trying to create a new application when the same discordId has a denied application should work", async function () {
      (await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).deny();
      await assert.doesNotReject(async () => await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT"));
    });

    it("trying to create a new application when the same mcUuid has a denied application should work", async function () {
      (await applicationFactory.create("293029505457586175", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).deny();
      await assert.doesNotReject(async () => await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT"));
    });
  });

  describe("getters", function(){
    it("getId should return 0", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getId(), 0);
    });

    it("getId should return on the second created application", async function(){
      await createAndSaveApplication();
      let application = await applicationFactory.create("293029505457586175", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, 1, "TxT#0001", "The__TxT");
      assert.strictEqual(application.getId(), 1);
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
      assert.strictEqual(application.getPublishAboutMe(), false);
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

    it("getStatus should return pending", async function(){
      let application = await createAndSaveApplication();
      assert.strictEqual(application.getStatus(), EApplicationStatus.pending);
    });

    it("getDenyReason should return correct value after application has been denied", async function(){
      let application = await createAndSaveApplication();
      application.deny("deny reason");
      assert.strictEqual(application.getDenyReason(), "deny reason");
    });

    it("getMcSkinUrl should return a url containing the uuid", async function () {
      let application = await createAndSaveApplication();
      let url = application.getMcSkinUrl();
      assert.ok(url.includes(application.getMcUuid()));
    });

    it("getDiscordAvatarUrl returns a url", async function () {
      let application = await createAndSaveApplication();
      let avatarUrl = await application.getDiscordAvatarUrl();
      assert.doesNotThrow(() => new URL(avatarUrl));
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

    it("setStatus should correctly set status pending", async function(){
      let application = await createAndSaveApplication();
      application.setStatus(EApplicationStatus.pending);
      assert.strictEqual(application.getStatus(), EApplicationStatus.pending);
    });

    it("setStatus should correctly set status denied", async function () {
      let application = await createAndSaveApplication();
      application.setStatus(EApplicationStatus.denied);
      assert.strictEqual(application.getStatus(), EApplicationStatus.denied);
    });

    it("setStatus and save should save the new status correctly", async function () {
      let application = await createAndSaveApplication();
      application.setStatus(EApplicationStatus.denied);
      await application.save();

      let loadedApplication = await applicationFactory.getById(0);
      assert.strictEqual(loadedApplication.getStatus(), EApplicationStatus.denied);
    });
  });

  describe("deny", function(){
    it("set status to denied", async function(){
      let application = await createAndSaveApplication();
      await application.deny("reason");
      assert.strictEqual(application.getStatus(), EApplicationStatus.denied);
    });

    it("set given deny reason", async function () {
      let application = await createAndSaveApplication();
      await application.deny("reason");
      assert.strictEqual(application.getDenyReason(), "reason");
    });

    it("send denied mail", async function(){
      return new Promise(async (resolve, reject) => {
        global.g.emitter.once("testing_email_sendApplicationDeniedMail", (application: Application) => {
          assert.strictEqual(application.getId(), 0);
          resolve();
        });

        let application = await createAndSaveApplication();
        await application.deny("reason");
      });
    });
  });

  describe("accept", function(){
    afterEach("clear member collection", async function () {
      const con = new Mongo("members", Member.schema);
      await con.connect();
      await con.deleteAll();
    });

    it("set status to accepted", async function(){
      let application = await createAndSaveApplication();
      await application.accept();
      assert.strictEqual(application.getStatus(), EApplicationStatus.accepted);
    });

    it("send accepted mail", function(){
      return new Promise<void>(async (resolve, reject) => {
        global.g.emitter.once("testing_email_sendApplicationAcceptedMail", (application: Application) => {
          assert.strictEqual(application.getId(), 0);
          resolve();
        });

        let application = await createAndSaveApplication();
        await application.accept();
      });
    });

    it("create a member from the application", async function(){
      let application = await createAndSaveApplication();
      await application.accept();

      let member = await memberFactory.getByDiscordId("293029505457586176");
      assert.ok(member);
    });

    it("dont create a member from the application if the discord user is not in the guild", async function(){
      let application = await applicationFactory.create("214884802749399041", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", true, true, true, null, "NotTxT#0001", "The__TxT");
      await application.accept();
      assert.rejects(async () => await memberFactory.getByDiscordId("214884802749399041"));
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

    it("create member with status pending", async function(){
      let application = await createAndSaveApplication();
      await application.accept();
      let member = await memberFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(member.getStatus(), EApplicationStatus.pending);
    });

    it("send welcome message", function(){
      return new Promise<void>(async (resolve, reject) => {
        global.g.emitter.once("testing_discordHelpers_sendMessage", (_message: string, _channelId: string) => {
          global.g.emitter.once("testing_discordHelpers_sendMessage", (message: string, channelId: string) => {
            assert.ok(message.includes("293029505457586176"));
            assert.strictEqual(channelId, config.discord_bot.channel.new_member_announcement);
            resolve();
          });
        });

        let application = await createAndSaveApplication();
        await application.accept();
      });
    });

    it("add member to whitelist", function(){
      return new Promise<void>(async (resolve, reject) => {
        global.g.emitter.once("testing_minecraft_rcon_send", (cmd: string) => {
          assert.strictEqual(cmd, "whitelist add The__TxT");
          resolve();
        });

        let application = await createAndSaveApplication();
        await application.accept();
      });
    });

    it("add member to paxterya role", function(){
      return new Promise<void>(async (resolve, reject) => {
        let application = await createAndSaveApplication();

        global.g.emitter.once("testing_discordHelpers_addMemberToRole", (discordId: string, roleId: string) => {
          assert.strictEqual(discordId, application.getDiscordId());
          assert.strictEqual(roleId, config.discord_bot.roles.paxterya);
          resolve();
        });

        await application.accept();
      });
    });

    it("set correct nickname in discord", async function(){
      const discordMember = discord_helpers.getMemberObjectById("293029505457586176");
      await discordMember.setNickname("test");
      const application = await createAndSaveApplication();
      await application.accept();
      const newDiscordMember = discord_helpers.getMemberObjectById("293029505457586176");
      assert.strictEqual(newDiscordMember.nickname, "The__TxT");
    });
  });

  describe("factory getters", async function(){
    it("getById should return a single correct application with 1 application in db", async function(){
      await createAndSaveApplication();

      let application = await applicationFactory.getById(0);
      assert.strictEqual(application.getId(), 0);
    });

    it("getById should return a single correct application with 3 application in db", async function () {
      await createAndSaveApplication();
      await applicationFactory.create("293029505457586175", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586174", "dac25e44d1024f3b819978ed62d209a3", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let application = await applicationFactory.getById(2);
      assert.strictEqual(application.getId(), 2);
    });

    it("getById should return falsy when there is no application with the given id in the db", async function(){
      await createAndSaveApplication();
      await applicationFactory.create("293029505457586175", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let res = await applicationFactory.getById(5);
      assert.ok(!res);
    });

    it("getByDiscordId should return an array of correct results with one correct one in the db", async function(){
      await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586172", "dac25e44d1024f3b819978ed62d209a3", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let res = await applicationFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].getDiscordId(), "293029505457586176");
    });

    it("getByDiscordId should return an array of correct results with two correct ones in the db", async function () {
      await (await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).deny();
      await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586172", "dac25e44d1024f3b819978ed62d209a3", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let res = await applicationFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(res.length, 2);
      assert.strictEqual(res[0].getDiscordId(), "293029505457586176");
      assert.strictEqual(res[1].getDiscordId(), "293029505457586176");
    });

    it("getByDiscordId should return an empty array no correct ones in the db", async function () {
      await applicationFactory.create("293029505457586170", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586172", "dac25e44d1024f3b819978ed62d209a3", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let res = await applicationFactory.getByDiscordId("293029505457586176");
      assert.strictEqual(res.length, 0);
    });

    it("getByMcUuid should return an array of correct results with one correct one in the db", async function () {
      await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586172", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null,"TxT#0001", "The__TxT");

      let res = await applicationFactory.getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(res.length, 1);
      assert.strictEqual(res[0].getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getByMcUuid should return an array of correct results with two correct ones in the db", async function () {
      await (await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).deny();
      await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586172", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let res = await applicationFactory.getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(res.length, 2);
      assert.strictEqual(res[0].getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(res[1].getMcUuid(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getByMcUuid should return an empty array no correct ones in the db", async function () {
      await applicationFactory.create("293029505457586170", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a5", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");
      await applicationFactory.create("293029505457586172", "dac25e44d1024f3b819978ed62d209a2", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT");

      let res = await applicationFactory.getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.strictEqual(res.length, 0);
    });

    it("getAcceptedByDiscordId should return the correct result with one accepted and one denied application in db", async function(){
      await (await createAndSaveApplication()).deny();
      await (await createAndSaveApplication()).accept();

      let res = await applicationFactory.getAcceptedByDiscordId("293029505457586176");
      assert.strictEqual(res[0].getDiscordId(), "293029505457586176");
    });

    it("getAcceptedByDiscordId should return [] with no accepted applications in db", async function () {
      await (await createAndSaveApplication()).deny();

      let res = await applicationFactory.getAcceptedByDiscordId("293029505457586176");
      assert.deepStrictEqual(res, []);
    });

    it("getAcceptedByDiscordId should return [] with no accepted applications in db for given discordId", async function () {
      await (await createAndSaveApplication()).deny();
      await (await applicationFactory.create("293029505457586171", "dac25e44d1024f3b819978ed62d209a0", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", false, true, true, null, "TxT#0001", "The__TxT")).accept();
      let res = await applicationFactory.getAcceptedByDiscordId("293029505457586176");
      assert.deepStrictEqual(res, []);
    });
  });
});