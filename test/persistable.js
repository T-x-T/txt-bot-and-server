require("./test.js");
const assert = require("assert");
const TestPersistable = require("./testPersitable.js");

describe("persistable", function(){

  describe("initialization", function(){

    it("instanciation with test values and mongo shouldnt throw", function(){
      assert.doesNotThrow(() => new TestPersistable("test", true, "mongo"));
    });

    it("calling init with mongo shouldnt throw", async function(){
      let testPersistable = new TestPersistable("test", true, "mongo");
      await assert.doesNotReject(() => testPersistable.init());
    });
  });

  describe("creating", function(){

    it("creating shouldnt reject", async function(){
      let testPersistable = new TestPersistable("test", true, "mongo");
      await testPersistable.init();
      await assert.doesNotReject(() => testPersistable.create());
    });
  });
});