const User = require("../src/user/user.js");
const UserFactory = require("../src/user/userFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const assert = require("assert");
const schema = User.schema;

async function createAndSaveNewUser(){
  console.log("start inner function")
  let userFactory = new UserFactory();
  await userFactory.connect();
  let user = await userFactory.create("293029505457586176", "TxT#0001");
  console.log("done with inner function")
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
      console.log("start")
      await assert.doesNotThrow(async () => await createAndSaveNewUser());
      console.log("end")
    });
  });

  describe("karma", function(){
    it("get karma should return 0 when karma hasnt been modified", async function(){
      //this.skip();
      let user = await createAndSaveNewUser();
      let karma = await user.getKarma();
      assert.equal(karma, 0);
    });
  });
});