require("./test.js");
const Member = require("../src/user/member.js");
const MemberFactory = require("../src/user/memberFactory.js");
const Mongo = require("../src/persistance/mongo.js");
const assert = require("assert");
const schema = Member.schema;

async function createAndSaveNewmember(){
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
      await assert.doesNotReject(async () => await createAndSaveNewmember());
    });
  });
});