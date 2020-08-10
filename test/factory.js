const assert = require("assert");
const TestFactory = require("./testFactory.js");

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
});