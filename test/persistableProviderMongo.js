const assert = require("assert");
const mongoose = require("mongoose");
const Mongo = require("../src/persistance/mongo.js");
const { captureRejectionSymbol } = require("events");

describe("PersistableProvider mongo", function(){
  
  it("class should instianciate without throwing an Exception when no options given", function(){
    assert.doesNotThrow(() => new Mongo());
  });

/*   it("calling Mongo#connect without providing options should not reject", function(){
    const con = new Mongo();
    assert.doesNotReject(() => con.connect(), mongoose.Promise);
  });

  it("calling Mongo#connect with a faulty mongodb_url should reject", function () {
    const con = new Mongo();
    con.connect(); 
  });*/

/*   it("class instanciation should throw when invalid option mongodb_url is given", async function(){
    //assert.throws(() => new Mongo({ mongodb_url: "this_is_invalid_af" }), new Error("Could not connect to database"));
    assert.rejects(async () => new Mongo({ mongodb_url: "this_is_invalid_af" }), { name: "UnhandledPromiseRejectionWarning", message: "Could not connect to database"});
  }); */

});