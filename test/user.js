const User = require("../src/user/user.js");
const UserFactory = require("../src/user/userFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const assert = require("assert");
const schema = User.schema;

async function createAndSaveNewUser(){
  let userFactory = new UserFactory();
  await userFactory.connect();
  let user = await userFactory.create("293029505457586176", "TxT#0001");
  return user;
}

beforeEach("clear member collection", async function(){
  const con = new Mongo("members", schema);
  await con.connect();
  await con.deleteAll();
});

describe("user", function(){
  describe("instanciation", function(){
    it("user should be able to be instanciated without throwing", function(){
      assert.doesNotThrow(() => new User("293029505457586176", "TxT#0001"));
    });

    it("creating and saving new user should not reject", async function(){
      await assert.doesNotReject(async () => await createAndSaveNewUser());
    });
  });

  describe("karma", function(){
    it("get karma should return 0 when karma hasnt been modified", async function(){
      let user = await createAndSaveNewUser();
      let karma = await user.getKarma();
      assert.equal(karma, 0);
    });

    it("adding 1 karma shouldnt reject and save correct value", async function () {
      let user = await createAndSaveNewUser();
      await assert.doesNotReject(async () => await user.modifyKarmaBy(1));
      let karma = await user.getKarma();
      assert.equal(karma, 1);
    });

    it("adding 10 karma shouldnt reject", async function () {
      let user = await createAndSaveNewUser();
      await assert.doesNotReject(async () => await user.modifyKarmaBy(10));
      let karma = await user.getKarma();
      assert.equal(karma, 10);
    });

    it("subtracting 1 karma shouldnt reject and save correct value", async function () {
      let user = await createAndSaveNewUser();
      await assert.doesNotReject(async () => await user.modifyKarmaBy(-1));
      let karma = await user.getKarma();
      assert.equal(karma, -1);
    });

    it("adding 0 karma shouldnt reject and save correct value", async function () {
      let user = await createAndSaveNewUser();
      await assert.doesNotReject(async () => await user.modifyKarmaBy(0));
      let karma = await user.getKarma();
      assert.equal(karma, 0);
    });
  });

  describe("get discord avatar URL", function(){
    it("calling User#getDiscordAvatarUrl does not reject", async function () {
      let user = await createAndSaveNewUser();
      assert.doesNotReject(async () => await user.getDiscordAvatarUrl());
    });

    it("calling User#getDiscordAvatarUrl returns a string", async function () {
      let user = await createAndSaveNewUser();
      let avatarUrl = await user.getDiscordAvatarUrl();
      assert.equal(typeof avatarUrl, "string");
    });

    it("calling User#getDiscordAvatarUrl returns a url", async function () {
      let user = await createAndSaveNewUser();
      let avatarUrl = await user.getDiscordAvatarUrl();
      assert.doesNotThrow(() => new URL(avatarUrl));
    });
  });

  describe("get user object", function(){
    if(!global.hasOwnProperty("cache")) global.cache = {};
    global.cache.discordUserObjects = {};

    it("calling User#getDiscordUserdata shouldnt reject", async function(){
      let user = await createAndSaveNewUser();
      await assert.doesNotReject(async () => user.getDiscordUserdata());
    });

    it("User#getDiscordUserdata should return a valid discord user object", async function(){
      let user = await createAndSaveNewUser();
      let userData = await user.getDiscordUserdata();

      assert.ok(userData.hasOwnProperty("id"));
      assert.ok(userData.hasOwnProperty("username"));
      assert.ok(userData.hasOwnProperty("discriminator"));
      assert.ok(userData.hasOwnProperty("public_flags"));
    }); 

    it("User#getDiscordUserdata should return a user object of the correct user", async function(){
      let user = await createAndSaveNewUser();
      let userData = await user.getDiscordUserdata();
      assert.equal(userData.id, user.data.discord)
    }); 
  });

  describe("setDiscordNick", function(){
    it("passing a correct nickname should not throw", async function(){
      let user = await createAndSaveNewUser();
      assert.doesNotThrow(() => user.setDiscordNick("TheTxt#1234"));
    });

    it("passing a correct nickname should save input", async function () {
      let user = await createAndSaveNewUser();
      user.setDiscordNick("TheTxt#1234");
      assert.equal(user.data.discord_nick, "TheTxt#1234")
    });

    it("passing nothing should throw", async function () {
      let user = await createAndSaveNewUser();
      assert.throws(() => user.setDiscordNick(), new Error("no input given"));
    });

    it("passing nick without # should throw", async function () {
      let user = await createAndSaveNewUser();
      assert.throws(() => user.setDiscordNick("TheTxt1234"), new Error("no # in new nick"));
    });

    it("passing nick without discriminator should throw", async function () {
      let user = await createAndSaveNewUser();
      assert.throws(() => user.setDiscordNick("TheTxt#"), new Error("no discriminator"));
    });

    it("passing an incorrect nickname should not save input", async function () {
      let user = await createAndSaveNewUser();
      try{
        user.setDiscordNick("TheTxt1234");
      }catch(e){}
      assert.notEqual(user.data.discord_nick, "TheTxt#1234");
    });
  });
});