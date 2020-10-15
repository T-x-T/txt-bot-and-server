require("./test.js");
const assert = require("assert");
const Application = require("../src/application/application.js");
const ApplicationFactory = require("../src/application/applicationFactory.js");
const application = require("../src/application/main.js");
const Mongo = require("../src/persistance/mongo.js");

async function createAndSaveApplication(){
  let applicationFactory = new ApplicationFactory();
  await applicationFactory.connect();
  let application = await applicationFactory.create("293029505457586176", "dac25e44d1024f3b819978ed62d209a1", "test@test.com", "germany", 7, 2000, "this is the about me text", "this is my motivation", "nice image", true, true, true, "TxT#0001", "The__TxT");
  return application;
}

describe("application", function(){
  beforeEach("clear member collection", async function () {
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

    it("getDenyReason should return correct value after application has been denied");
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
  });
});