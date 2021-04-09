require("./test.js");
const assert = require('assert');
const { AssertionError } = require('assert');

describe('sanity-checks', function(){
  it('1 equals 1', function(){
    assert.strictEqual(1, 1);
  });

  it('false is not true', function(){
    assert.ok(!false);
  })
});