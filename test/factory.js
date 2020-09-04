require("./test.js");
const assert = require("assert");
const TestFactory = require("./testFactory.js");
const TestPersistable = require("./testPersitable.js");

describe("factory base class", function(){
  describe("init", function(){
    it("factory base class should not throw on instanciation with persistanceProvider mongo", function () {
      assert.doesNotThrow(() => new TestFactory({ name: "test", persistanceProvider: "mongo" }));
    });

    it("Factory#connect should not reject", async function () {
      assert.doesNotReject(() => new TestFactory({ name: "test", persistanceProvider: "mongo" }).connect());
    });
  });

  describe("create", function(){
    it("TestFactory#create with sample values should not throw", async function(){
      let testFactory = new TestFactory({ name: "test", persistanceProvider: "mongo" });
      await testFactory.connect();
      assert.doesNotThrow(() => testFactory.create("test", true));
    });

    it("TestFactory#create with sample values should be put into object correctly", async function () {
      let testFactory = new TestFactory({ name: "test", persistanceProvider: "mongo" });
      await testFactory.connect();
      let testInstance = testFactory.create("test", true);
      assert.equal(testInstance.data.text, "test");
      assert.ok(testInstance.data.bool);
    });
  });

  describe("get", function(){
    before("save new entry to db", async function(){
      let testPersistable = new TestPersistable("test", true, "mongo");
      await testPersistable.init();
      await testPersistable.save();
    });

    it("get entry with id 0 should return instanceof TestPersistable", async function () {
      let testFactory = new TestFactory({ name: "test", persistanceProvider: "mongo" });
      await testFactory.connect();
      let res = await testFactory.getById(0);
      assert.ok(res instanceof TestPersistable);
    });

    it("get entry with id 0 should return correct instance", async function(){
      let testFactory = new TestFactory({ name: "test", persistanceProvider: "mongo" });
      await testFactory.connect();
      let res = await testFactory.getById(0);
      assert.equal(res.data.id, 0);
    });
  });
});