require("./test.js");

import assert = require("assert");
import log = require("../log");
import Mongo = require("../persistance/mongo.js");

//Stolen from stackoverflow: https://stackoverflow.com/a/27872144
function randomString(len: number) {
  var str = "",
    i = 0,
    min = 0,
    max = 62;
  for(; i++ < len;) {
    var r = Math.random() * (max - min) + min << 0;
    str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
  }
  return str;
}

async function writeExampleLogs(count: number){
  for(let i = 0; i < count; i++) await writeExampleLog();
}

let _level = 0;
let _component = "test";
let _name = "example log";
let _data = {test: true, string: "test"};

async function writeExampleLog(){
  await log.write(_level, _component, _name, _data);
}

describe("log", function(){
  beforeEach("clean database", async function(){
    const con = new Mongo("log", log.schema);
    await con.connect();
    await con.deleteAll();
  });

  describe("write", function(){
    it("the input should be correctly saved in the database with randomized inputs", async function(){
      for(let i = 0; i < 100; i++){
        let level = Math.ceil(Math.random() * 3);
        let component = randomString(Math.ceil(Math.random() * 10));
        let name = randomString(Math.ceil(Math.random() * 100));
        let payload = {key: randomString(Math.ceil(Math.random() * 100)), depth: {another_key: randomString(Math.ceil(Math.random() * 80))}};
        
        let logEntry = await log.write(level, component, name, payload);

        assert.strictEqual(logEntry.level, level);
        assert.strictEqual(logEntry.component, component);
        assert.strictEqual(logEntry.name, name);
        assert.deepStrictEqual(logEntry.data, payload);
      }
    });

    it("the input should be correctly saved in the database with randomized inputs and timestamp", async function () {
      for(let i = 0; i < 100; i++) {
        let level = Math.ceil(Math.random() * 3);
        let component = randomString(Math.ceil(Math.random() * 10));
        let name = randomString(Math.ceil(Math.random() * 100));
        let payload = {key: randomString(Math.ceil(Math.random() * 100)), depth: {another_key: randomString(Math.ceil(Math.random() * 80))}};
        let timestamp = Date.now() - Math.ceil(Math.random() * 1000000);

        let logEntry = await log.write(level, component, name, payload, timestamp);

        assert.strictEqual(logEntry.level, level);
        assert.strictEqual(logEntry.component, component);
        assert.strictEqual(logEntry.name, name);
        assert.deepStrictEqual(logEntry.data, payload);
        assert.strictEqual(logEntry.timestamp.valueOf(), timestamp);
      }
    });
  });

  describe("read", function(){
    it("should find all logs matching filter with timestamp in the past", async function(){
      await writeExampleLogs(10);
      let logEntries = await log.read(0, Date.now() - 10000);
      
      assert.strictEqual(logEntries.length, 10);
    });

    it("should return logs with correct data", async function () {
      await writeExampleLogs(10);
      let logEntries = await log.read(0, Date.now() - 10000);

      logEntries.forEach((logEntry: any) => { //TODO: fix any
        assert.strictEqual(logEntry.level, _level);
        assert.strictEqual(logEntry.component, _component);
        assert.strictEqual(logEntry.name, _name);
        assert.deepStrictEqual(logEntry.data, _data);
      });
    });

    it("should return 0 results with timestamp in the future", async function(){
      await writeExampleLogs(10);
      let logEntries = await log.read(0, Date.now() + 10000);

      assert.strictEqual(logEntries.length, 0);
    });

    it("calling without a level should return all logs since the given timestamp", async function(){
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));

      let logEntries = await log.read(false, Date.now() - (1000 * 60 * 60 * 24 * 7));

      assert.strictEqual(logEntries.length, 4);
      logEntries.forEach((logEntry: any) => assert.ok(logEntry.timestamp > Date.now() - (1000 * 60 * 60 * 24 * 7)));
    });
  });

  describe("readById", async function(){
    it("should return a single object", async function(){
      await writeExampleLogs(10);
      let logEntry = await log.readById(await log.write(_level, _component, _name, _data)._id);

      assert.strictEqual(typeof logEntry, "object");
    });

    it("should return the correct log", async function(){
      for(let i = 0; i < 100; i++) {
        let level = Math.ceil(Math.random() * 3);
        let component = randomString(Math.ceil(Math.random() * 10));
        let name = randomString(Math.ceil(Math.random() * 100));
        let payload = {key: randomString(Math.ceil(Math.random() * 100)), depth: {another_key: randomString(Math.ceil(Math.random() * 80))}};

        let id = await log.write(level, component, name, payload);
        let logEntry = await log.readById(id);

        assert.strictEqual(logEntry.level, level);
        assert.strictEqual(logEntry.component, component);
        assert.strictEqual(logEntry.name, name);
        assert.deepStrictEqual(logEntry.data, payload);
      }
    });
  });

  describe("prune", function(){
    it("should delete only logs older than given amount of days", async function(){
      await log.write(_level, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(_level, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(_level, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(_level, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));

      await log.prune(7);

      let logEntries = await log.read(_level, Date.now() - (1000 * 60 * 60 * 24 * 10));

      assert.strictEqual(logEntries.length, 2);
      logEntries.forEach((logEntry: any) => assert.ok(logEntry.timestamp > Date.now() - (1000 * 60 * 60 * 24 * 7)));
    });
  });

  describe("prune level", function(){
    it("should only prune logs of given level", async function(){
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(1, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 8));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));
      await log.write(2, _component, _name, _data, Date.now() - (1000 * 60 * 60 * 24 * 6));

      await log.pruneLevel(7, 2);

      let logEntries = await log.read(false, Date.now() - (1000 * 60 * 60 * 24 * 10));

      assert.strictEqual(logEntries.length, 6);
      logEntries.forEach((logEntry: any) => {
        if(logEntry.level === 1){
          assert.ok(logEntry.timestamp > Date.now() - (1000 * 60 * 60 * 24 * 10));
        }else{
          assert.ok(logEntry.timestamp > Date.now() - (1000 * 60 * 60 * 24 * 7));
        }
      });
    });
  });
});