require("./test.js");

const assert = require("assert");
const blog = require("../blog");
const Mongo = require("../persistance/mongo.js");

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

describe("blog", function(){
  beforeEach("clear blog collection", async function() {
    const con = new Mongo("post", blog.schema);
    await con.connect();
    await con.deleteAll();
  });

  describe("create", function(){
    it("throw without title", async function(){
      await assert.rejects(async () => blog.create({author: "author", body: "body", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw with empty title", async function() {
      await assert.rejects(async () => blog.create({title: "", author: "author", body: "body", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw without author", async function() {
      await assert.rejects(async () => blog.create({title: "title", body: "body", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw with empty author", async function() {
      await assert.rejects(async () => blog.create({title: "title", author: "", body: "body", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw without body", async function() {
      await assert.rejects(async () => blog.create({title: "title", author: "author", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw with empty body", async function() {
      await assert.rejects(async () => blog.create({title: "title", author: "", body: "", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("save correct input", async function(){
      await blog.create({title: "title", author: "author", body: "body", date: new Date("December 17, 1995 03: 24: 00"), public: true});
      let res = await blog.getAll();
      res = res[0];
      assert.strictEqual(res.title, "title");
      assert.strictEqual(res.author, "author");
      assert.strictEqual(res.body, "body");
      assert.deepStrictEqual(res.date, new Date("December 17, 1995 03: 24: 00"));
      assert.strictEqual(res.public, true);
    });

    it("if not date is given, use cuurent date", async function(){
      await blog.create({title: "title", author: "author", body: "body", public: true});
      let res = await blog.getAll();
      res = res[0];
      assert.ok(res.date > Date.now() - 2000);
      assert.ok(res.date < Date.now());
    });

    it("save random data correctly", async function(){
      for(let i = 0; i < 100; i++){
        let title = randomString(Math.ceil(Math.random() * 100)) + "a";
        let author = randomString(Math.ceil(Math.random() * 100)) + "a";
        let body = randomString(Math.ceil(Math.random() * 100)) + "a";
        let date = new Date(Math.ceil(Math.random() * 10000000));
        let visible = Math.random() > 0.5 ? true : false;
        
        await blog.create({title: title, author: author, body: body, date: date, public: visible});
        let res = await blog.getAll();
        res = res[res.length - 1];
        
        assert.strictEqual(res.title, title);
        assert.strictEqual(res.author, author);
        assert.strictEqual(res.body, body);
        assert.deepStrictEqual(res.date, date);
        assert.strictEqual(res.public, visible);
      }
    });
  });

  describe("replace", function(){
    it("throw with empty title", async function() {
      await assert.rejects(async () => blog.replace({title: "", author: "author", body: "body", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw without author", async function() {
      await assert.rejects(async () => blog.replace({title: "title", body: "body", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw without body", async function() {
      await assert.rejects(async () => blog.replace({title: "title", author: "author", public: true}), new Error("Incorrect Input! title, author and body must be truthy"));
    });

    it("throw without id", async function() {
      await assert.rejects(async () => blog.replace({title: "title", author: "author", body: "body", public: true}), new Error("blog must contain numerical id to replace"));
    });

    it("throw with id of type string", async function() {
      await assert.rejects(async () => blog.replace({id: "1", title: "title", author: "author", body: "body", public: true}), new Error("blog must contain numerical id to replace"));
    });

    it("throw when no blog with given id exists", async function() {
      await blog.create({title: "title", author: "author", body: "body", public: false});
      await assert.rejects(async () => await blog.replace({id: 10, title: "title", author: "author", body: "body", public: false}), new Error("no blog with given id found"));
    });

    it("if not date is given, use cuurent date", async function() {
      await blog.create({title: "title", author: "author", body: "body", public: true});
      await blog.replace({id: 0, title: "title", author: "author", body: "body", public: false});
      let res = await blog.getAll();
      res = res[0];
      assert.ok(res.date > Date.now() - 2000);
      assert.ok(res.date < Date.now());
    });

    it("replace existing one", async function(){
      for(let i = 0; i < 100; i++){
        await blog.create({title: "title", author: "author", body: "body", public: false});

        let title = randomString(Math.ceil(Math.random() * 100)) + "a";
        let author = randomString(Math.ceil(Math.random() * 100)) + "a";
        let body = randomString(Math.ceil(Math.random() * 100)) + "a";
        let date = new Date(Math.ceil(Math.random() * 10000000));
        let visible = Math.random() > 0.5 ? true : false;

        await blog.replace({id: i, title: title, author: author, body: body, date: date, public: visible});
        let res = await blog.getAll();
        res = res[res.length - 1];

        assert.strictEqual(res.title, title);
        assert.strictEqual(res.author, author);
        assert.strictEqual(res.body, body);
        assert.deepStrictEqual(res.date, date);
        assert.strictEqual(res.public, visible);
      }
    });
  });

  describe("getAll", function(){
    it("returns an empty array when there are no blogs", async function(){
      let res = await blog.getAll();
      assert.strictEqual(res.length, 0);
    });

    it("return an array of length 100 with 100 elements in db", async function(){
      for(let i = 0; i < 100; i++) {
        let title = randomString(Math.ceil(Math.random() * 100)) + "a";
        let author = randomString(Math.ceil(Math.random() * 100)) + "a";
        let body = randomString(Math.ceil(Math.random() * 100)) + "a";
        let date = new Date(Math.ceil(Math.random() * 10000000));
        let visible = Math.random() > 0.5 ? true : false;

        await blog.create({title: title, author: author, body: body, date: date, public: visible});
      }
      let res = await blog.getAll();
      assert.strictEqual(res.length, 100);
    });

    it("retrieve random data correctly", async function() {
      for(let i = 0; i < 100; i++) {
        let title = randomString(Math.ceil(Math.random() * 100)) + "a";
        let author = randomString(Math.ceil(Math.random() * 100)) + "a";
        let body = randomString(Math.ceil(Math.random() * 100)) + "a";
        let date = new Date(Math.ceil(Math.random() * 10000000));
        let visible = Math.random() > 0.5 ? true : false;

        await blog.create({title: title, author: author, body: body, date: date, public: visible});
        let res = await blog.getAll();
        res = res[res.length - 1];

        assert.strictEqual(res.title, title);
        assert.strictEqual(res.author, author);
        assert.strictEqual(res.body, body);
        assert.deepStrictEqual(res.date, date);
        assert.strictEqual(res.public, visible);
      }
    });
  });

  describe("getPublic", function(){
    it("retrieve public post with date in the past", async function(){
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      let res = await blog.getPublic();
      assert.strictEqual(res.length, 1);
    });

    it("dont retrieve public post with date in the future", async function() {
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: true});
      let res = await blog.getPublic();
      assert.strictEqual(res.length, 0);
    });

    it("dont retrieve private post with date in the past", async function() {
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: false});
      let res = await blog.getPublic();
      assert.strictEqual(res.length, 0);
    });

    it("dont retrieve private post with date in the future", async function() {
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: false});
      let res = await blog.getPublic();
      assert.strictEqual(res.length, 0);
    });

    it("only retrieve public posts with date in the future with multiple posts in db", async function(){
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: true});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: true});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: false});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() - 8000), public: false});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: false});
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: false});

      let res = await blog.getPublic();
      assert.strictEqual(res.length, 4);
    });

    it("retrieve public random data correctly", async function() {
      for(let i = 0; i < 100; i++) {
        let title = randomString(Math.ceil(Math.random() * 100)) + "a";
        let author = randomString(Math.ceil(Math.random() * 100)) + "a";
        let body = randomString(Math.ceil(Math.random() * 100)) + "a";
        let date = new Date(Math.ceil(Math.random() * 10000000));
        let visible = true;

        await blog.create({title: title, author: author, body: body, date: date, public: visible});
        let res = await blog.getPublic();
        res = res[res.length - 1];

        assert.strictEqual(res.title, title);
        assert.strictEqual(res.author, author);
        assert.strictEqual(res.body, body);
        assert.deepStrictEqual(res.date, date);
        assert.strictEqual(res.public, visible);
      }
    });
  });

  describe("getFiltered", function(){
    it("retrieve posts based on title", async function(){
      await blog.create({title: "title1", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title2", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title2", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});

      let res = await blog.getFiltered({title: "title1"});
      res = res [0];

      assert.strictEqual(res.title, "title1");
    });
  });

  describe("getNewest", function(){
    it("return single object", async function(){
      await blog.create({title: "title", author: "author", body: "body", date: new Date(Date.now() + 8000), public: false});

      let res = await blog.getNewest();
      assert.strictEqual(typeof res, "object");
      assert.strictEqual(res.title, "title");
    });

    it("return the post that was added last, despite of the date", async function(){
      await blog.create({title: "title1", author: "author", body: "body", date: new Date(Date.now() - 8000), public: true});
      await blog.create({title: "title2", author: "author", body: "body", date: new Date(Date.now() - 80000), public: true});
      await blog.create({title: "title3", author: "author", body: "body", date: new Date(Date.now() - 800000), public: true});

      let res = await blog.getNewest();
      assert.strictEqual(res.title, "title3");
    });

    it("retrieve random data correctly", async function() {
      for(let i = 0; i < 100; i++) {
        let title = randomString(Math.ceil(Math.random() * 100)) + "a";
        let author = randomString(Math.ceil(Math.random() * 100)) + "a";
        let body = randomString(Math.ceil(Math.random() * 100)) + "a";
        let date = new Date(Math.ceil(Math.random() * 10000000));
        let visible = Math.random() > 0.5 ? true : false;

        await blog.create({title: title, author: author, body: body, date: date, public: visible});
        let res = await blog.getNewest();

        assert.strictEqual(res.title, title);
        assert.strictEqual(res.author, author);
        assert.strictEqual(res.body, body);
        assert.deepStrictEqual(res.date, date);
        assert.strictEqual(res.public, visible);
      }
    });
  });
});

export default {}