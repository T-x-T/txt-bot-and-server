require("./test.js");
const Member = require("../src/user/member.js");
const MemberFactory = require("../src/user/memberFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const assert = require("assert");
const schema = Member.schema;

async function createAndSaveNewMember(){
  let memberFactory = new MemberFactory();
  await memberFactory.connect();
  let member = await memberFactory.create("293029505457586176", "TxT#0001", "dac25e44d1024f3b819978ed62d209a1", "The__TxT", "germany", 7, 2000, true, true);
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
});