require("./test.js");
const Member = require("../src/user/member.js");
const MemberFactory = require("../src/user/memberFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const assert = require("assert");
const schema = Member.schema;
const discord_helpers = require("../src/discord_bot");

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
  describe("instanciation", function(){
    it("instanciating shouldnt reject", async function(){
      await assert.doesNotReject(async () => await createAndSaveNewMember());
    });
  });

  describe("getMcSkinUrl", function(){
    it("getMcSkinUrl should return a url containing the uuid", async function(){
      let member = await createAndSaveNewMember();
      let url = member.getMcSkinUrl();
      assert.ok(url.includes(member.data.mcUUID));
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
      assert.equal(member.data.mcName, "The__TxT");
    });

    it("updateMcIgn should resolve with correct McIgn", async function () {
      let member = await createAndSaveNewMember();
      let ign = await member.updateMcIgn();
      assert.equal(ign, "The__TxT");
    });
  });

  describe("basic getters", function(){
    it("getMcUUID should return correct UUID", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getMcIgn should return correct IGN", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getMcIgn(), "The__TxT");
    });

    it("getCountry should return correct country when publish_country is true", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getCountry(), "germany");
    });

    it("getCountry should return correct country when publish_country is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.equal(member.getCountry(), "germany");
    });

    it("getCountryConsiderPrivacy should return correct country when publish_country is true", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getCountryConsiderPrivacy(), "germany");
    });

    it("getCountryConsiderPrivacy should return false when publish_country is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.equal(member.getCountryConsiderPrivacy(), false);
    });

    it("getBirthMonth should return correct month of birth (starting at 1 for jan) when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getBirthMonth(), 7);
    });

    it("getBirthMonth should return correct month of birth (starting at 1 for jan) when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.equal(member.getBirthMonth(), 7);
    });

    it("getBirthYear should return correct year of birth when publish_age is true", async function () {
      let member = await createAndSaveNewMember();
      assert.equal(member.getBirthYear(), 2000);
    });

    it("getBirthYear should return correct year of birth when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.equal(member.getBirthYear(), 2000);
    });

    it("getAge should return correct age when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getAge(), 20);
    });

    it("getAge should return correct age when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.equal(member.getAge(), 20);
    });

    it("getAgeConsiderPrivacy should return correct age when publish_age is true", async function(){
      let member = await createAndSaveNewMember();
      assert.equal(member.getAgeConsiderPrivacy(), 20);
    });

    it("getAgeConsiderPrivacy should return false when publish_age is false", async function () {
      let member = await createAndSaveNewPrivateMember();
      assert.equal(member.getAgeConsiderPrivacy(), false);
    });

    it("getPrivacySettings should return correct privacy settings object", async function(){
      let member = await createAndSaveNewMember();
      let privacy = member.getPrivacySettings();
      assert.ok(privacy.publish_country);
      assert.ok(privacy.publish_age);
    });
  });

  describe("factory getters", function(){
    it("getByDiscordId should retrieve correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByDiscordId("293029505457586176");
      assert.equal(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
    });

    it("getByDiscordId should reject when no discord_id is given", async function () {
      await assert.rejects(async () => await new MemberFactory().getByDiscordId(), new Error("No discord_id given"));
    });

    it("getByDiscordId should create a correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByDiscordId("293029505457586176");
      assert.equal(member.getDiscordNick(), "TxT#0001");
      assert.equal(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
      assert.equal(member.getMcIgn(), "The__TxT");
      assert.equal(member.getCountry(), "germany");
      assert.equal(member.getBirthMonth(), 7);
      assert.equal(member.getBirthYear(), 2000);
      assert.equal(member.getPrivacySettings().publish_country, true);
      assert.equal(member.getPrivacySettings().publish_age, true);
    });

    it("getByMcUuid should retrieve correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.equal(member.getDiscordId(), "293029505457586176");
    });

    it("getByMcUuid should create a correct object", async function () {
      await createAndSaveNewMember();
      let member = await new MemberFactory().getByMcUuid("dac25e44d1024f3b819978ed62d209a1");
      assert.equal(member.getDiscordNick(), "TxT#0001");
      assert.equal(member.getMcUUID(), "dac25e44d1024f3b819978ed62d209a1");
      assert.equal(member.getMcIgn(), "The__TxT");
      assert.equal(member.getCountry(), "germany");
      assert.equal(member.getBirthMonth(), 7);
      assert.equal(member.getBirthYear(), 2000);
      assert.equal(member.getPrivacySettings().publish_country, true);
      assert.equal(member.getPrivacySettings().publish_age, true);
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
});