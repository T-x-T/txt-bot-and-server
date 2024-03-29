import assert = require("assert");
import Mongo = require("../../persistance/mongo.js");

const schema = {
  id: {
    type: Number,
    index: true,
    unique: true,
    default: 0,
    autoIncrement: true
  },
  text: String,
  bool: Boolean
};

const example_entry = {
  text: "hello world!",
  bool: true,
  id: undefined as any
};

async function getConnection(){
  const con = new Mongo("test", schema);
  await con.connect();
  return con;
}

async function saveExample(){
  await assert.doesNotReject(async () => {
    const con = await getConnection();
    await con.create(example_entry);
  });
}

async function saveMultipleExamples(count: number){
  for (let i = 0; i < count; i++) await saveExample();
}

describe("PersistanceProvider mongo", function(){
  
  after("clean test DB", async function(){
    const con = await getConnection();
    await con.deleteAll();
  });

  describe("setup", function(){
    it("class should instianciate without throwing an Exception when no options given", function () {
      assert.doesNotThrow(() => new Mongo("test", schema));
    });

    it("calling Mongo#connect without providing options should not reject", async function () {
      const con = new Mongo("test", schema);
      await assert.doesNotReject(() => con.connect());
    });
  });

  describe("create", function(){
    it("saving example_entry once should not reject", async function () {
      await assert.doesNotReject(() => saveExample());
    });

    it("saving example_entry twice should not reject", async function () {
      await assert.doesNotReject(() => saveMultipleExamples(2));
    });

    it("saving example_entry 100 times should not reject", async function () {
      await assert.doesNotReject(() => saveMultipleExamples(100));
    });
  });

  describe("retrieve all", function(){
    it("retrieving all entries should not reject", async function(){
      let con = await getConnection();
      await assert.doesNotReject(() => con.retrieveAll());
    });

    it("retrieving all entries should return more than one entry", async function(){
      let con = await getConnection();
      let res = await con.retrieveAll();
      assert.ok(res.length > 1);
    });

    it("retrieving all entries should return correct entries", async function () {
      let con = await getConnection();
      let res = await con.retrieveAll();
      assert.ok(res[0].hasOwnProperty("id"));
      assert.ok(res[0].hasOwnProperty("text"));
      assert.ok(res[0].hasOwnProperty("bool"));
    });
  });

  describe("delete all", function(){
    it("deleteing all entries should not reject", async function(){
      let con = await getConnection();
      await assert.doesNotReject(() => con.deleteAll());
    });

    it("deleting all entries with one entry in the database should leave no entries behind", async function(){
      let con = await getConnection();
      await saveExample();
      await con.deleteAll();
      let res = await con.retrieveAll();
      assert.strictEqual(res.length, 0);
    });
  });

  describe("retrieve filtered", function(){
    let con: Mongo;
    before("delete existing enties and then add 10 test_entries", async function(){
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("retrieving entry with id 0 should return the correct entry", async function(){
      let res = await con.retrieveFiltered({id: 0});
      assert.strictEqual(res[0].id, 0);
    });

    it("retrieving all entries with an id over 5 should return 4 entries", async function(){
      let res = await con.retrieveFiltered({id: {$gt: 5}});
      assert.strictEqual(res.length, 4);
    });
  });

  describe("retrieve sorted", function () {
    let con: Mongo;
    before("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("retrieving with sort value null should return default sort", async function () {
      let res = await con.retrieveFilteredAndSorted({}, null);
      assert.strictEqual(res[0].id, 0);
    });

    it("retrieveing with id sorted desc should sort correctly", async function(){
      let res = await con.retrieveFilteredAndSorted({}, {id: -1});
      assert.strictEqual(res[0].id, 9);
    });
  });

  describe("retrieve first", function(){
    let con: Mongo;
    before("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("retrieving should return an object, not an array", async function(){
      let res = await con.retrieveFirst();
      assert.strictEqual(typeof res, "object");
      assert.ok(!Array.isArray(res));
    });

    it("retrieving should return the first entry", async function(){
      let res = await con.retrieveFirst();
      assert.strictEqual(res.id, 0);
    });
  });

  describe("retrieve first filtered", function () {
    let con: Mongo;
    before("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("retrieving should return an object, not an array", async function () {
      let res = await con.retrieveFirstFiltered({id: {$gt: 5}});
      assert.strictEqual(typeof res, "object");
      assert.ok(!Array.isArray(res));
    });

    it("retrieving should return the first entry", async function () {
      let res = await con.retrieveFirstFiltered({ id: {$gt: 5}});
      assert.strictEqual(res.id, 6);
    });
  });

  describe("retrieve newest", function () {
    let con: Mongo;
    before("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("retrieving should return an object, not an array", async function () {
      let res = await con.retrieveNewest();
      assert.strictEqual(typeof res, "object");
      assert.ok(!Array.isArray(res));
    });

    it("retrieving should return the last entry", async function () {
      let res = await con.retrieveNewest();
      assert.strictEqual(res.id, 9);
    });
  });

  describe("retrieve newest filtered", function () {
    let con: Mongo;
    before("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("retrieving should return an object, not an array", async function () {
      let res = await con.retrieveNewestFiltered({id: {$lt: 5}});
      assert.strictEqual(typeof res, "object");
      assert.ok(!Array.isArray(res));
    });

    it("retrieving should return the last entry", async function () {
      let res = await con.retrieveNewestFiltered({id: {$lt: 5}});
      assert.strictEqual(res.id, 4);
    });
  });

  describe("delete filtered", function(){
    let con: Mongo;
    beforeEach("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("deleting one entry should leave 9 behind", async function(){
      await con.deleteByFilter({id: 0});
      let res = await con.retrieveAll();
      assert.strictEqual(res.length, 9);
    });

    it("deleting entry with id 5 should actually delete entry with id 5", async function(){
      await con.deleteByFilter({id: 5});
      let res = await con.retrieveFiltered({id: 5});
      assert.strictEqual(res.length, 0);
    });

    it("deleting the first 5 entries should leave 5 behind", async function(){
      await con.deleteByFilter({id: {$lt: 5}});
      let res = await con.retrieveAll();
      assert.strictEqual(res.length, 5);
    });
  });

  describe("replace", function(){
    let con: Mongo;
    beforeEach("delete existing enties and then add 10 test_entries", async function () {
      con = await getConnection();
      await con.deleteAll();
      await saveMultipleExamples(10);
    });

    it("replacing should correctly save the new entry", async function(){
      let new_entry = example_entry;
      new_entry.id = 3;
      new_entry.text = "yeet";
      await con.save(new_entry);
      let res = await con.retrieveFirstFiltered({id: 3});
      assert.strictEqual(res.text, "yeet");
    });
  });
});