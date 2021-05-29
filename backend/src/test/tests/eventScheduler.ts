import assert = require("assert");
import eventScheduler = require("../../eventScheduler/index.js");
import Mongo = require("../../persistance/mongo.js");

const timestamp1 = new Date();
const event1 = "test";
const args1 = ["arg1", "arg2"];
const timestamp2 = new Date(Date.now() + 100000);
const event2 = "test";
const args2 = ["arg11", "arg21"];

async function getCon() {
  const con = new Mongo(eventScheduler.dbOptions.name, eventScheduler.dbOptions.schema);
  await con.connect();
  return con;
}

describe("eventScheduler", function(){

  beforeEach("clear scheduledEvents collection", async function(){
    const con = await getCon();
    await con.deleteAll();
  });

  describe("init", function(){
    it("should not reject with empty database", async function(){
      await assert.doesNotReject(() => eventScheduler.init())
    });
  });

  describe("schedule", function(){
    it("should save new entry to database", async function(){
      await eventScheduler.schedule(timestamp1, event1, args1);
      const con = await getCon();
      const res = (await con.retrieveFirst()).toObject();
      
      assert.deepStrictEqual(res.timestamp, timestamp1);
      assert.deepStrictEqual(res.event, event1);
      assert.deepStrictEqual(res.args, args1);
    });
  });

  describe("getAll", function(){
    it("should get all events", async function(){
      await eventScheduler.schedule(timestamp1, event1, args1);
      await eventScheduler.schedule(timestamp2, event2, args2);

      const res = await eventScheduler.getAll();

      assert.strictEqual(res.length, 2);
      const res1 = res[0];
      assert.deepStrictEqual(res1.timestamp, timestamp1);
      assert.deepStrictEqual(res1.event, event1);
      assert.deepStrictEqual(res1.args, args1);
      const res2 = res[1];
      assert.deepStrictEqual(res2.timestamp, timestamp2);
      assert.deepStrictEqual(res2.event, event2);
      assert.deepStrictEqual(res2.args, args2);
    });
  });

  describe("deleteOldEvents", function(){
    it("should delete events with timestamp from the past", async function(){
      await eventScheduler.schedule(new Date(Date.now() - 1000), event1, args1);
      await eventScheduler.schedule(timestamp2, event2, args2);

      await eventScheduler.deleteOldEvents();

      const res = await eventScheduler.getAll();

      assert.strictEqual(res.length, 1);

      assert.deepStrictEqual(res[0].timestamp, timestamp2);
      assert.deepStrictEqual(res[0].event, event2);
      assert.deepStrictEqual(res[0].args, args2);
    });
  }); 
});