//Tests for user component

//Dependencies
const config = require('../config');
const assert = require('assert');
const data = require('../src/data');
const user = require('../src/user');


function create_multiple(ids, callback){
  create_multiple_sub(0, ids, callback)
};

function create_multiple_sub(i, ids, callback) {
  if(i < ids.length){
    user.get({discord: ids[i]}, false, function(err, doc) {
      assert.ok(!err);
      create_multiple_sub(++i, ids, callback);
    });
  }else{
    callback();
  }
};

describe('user', function(){

  beforeEach(function(done){
    data.delete({}, 'user', false, function(err){
      assert.ok(!err);
      done();
    });
  });

  describe('get', function(){

    it('get a non-existent user to create one', function(done){
      user.get({discord: '212826594123710464'}, false, function(err, docs){
        assert.ok(!err);
        assert.ok(docs);
        assert.equal(docs.length, 1);
        assert.equal(docs[0].discord, '212826594123710464');
        done();
      });
    });

    it('get a non-existent user to create one with option first=true', function(done) {
      user.get({discord: '212826594123710464'}, {first: true}, function(err, docs) {
        assert.ok(!err);
        assert.ok(docs);
        assert.ok(!Array.isArray(docs));
        assert.equal(docs.discord, '212826594123710464');
        done();
      });
    });

    it('get all users with only one existing', function(done) {
      user.get({discord: '212826594123710464'}, false, function(err, docs) {
        user.get({discord: '212826594123710464'}, false, function(err, docs) {
          assert.ok(!err);
          assert.ok(docs);
          assert.equal(docs.length, 1);
          assert.equal(docs[0].discord, '212826594123710464');
          done();
        });
      });
    });

    it('get all users with only one existing with option first=true', function(done) {
      user.get({discord: '212826594123710464'}, false, function(err, docs) {
        user.get({discord: '212826594123710464'}, {first: true}, function(err, docs) {
          assert.ok(!err);
          assert.ok(docs);
          assert.ok(!Array.isArray(docs));
          assert.equal(docs.discord, '212826594123710464');
          done();
        });
      });
    });

    it('get five non-existent users', function(done){
      create_multiple(['212826594123710464', '293029505457586176', '624980994889613312', '205520907815485440', '195210774199664641'], function(){
        user.get({}, false, function(err, docs){
          assert.ok(!err);
          assert.ok(docs);
          assert.equal(docs.length, 5);
          assert.equal(docs[3].discord, '205520907815485440');
          done();
        });
      });
    });

  });

  describe('delete', function() {

    it('delete one user', function(done){
      user.get({discord: '212826594123710464'}, false, function(err, docs) {
        assert.ok(!err);
        assert.ok(docs);
        user.delete({discord: '212826594123710464'}, false, function(err){
          assert.ok(!err);
          data.get({}, 'user', false, function(err, docs){
            assert.ok(!err);
            assert.equal(docs.length, 0);
            done();
          });
        });
      });
    });

    it('delete one user with 5 in the database', function(done) {
      create_multiple(['212826594123710464', '293029505457586176', '624980994889613312', '205520907815485440', '195210774199664641'], function() {
        user.delete({discord: '212826594123710464'}, false, function(err) {
          assert.ok(!err);
          data.get({}, 'user', false, function(err, docs) {
            assert.ok(!err);
            assert.equal(docs.length, 4);
            done();
          });
        });
      });
    });

    it('delete all users with 5 in the database', function(done) {
      create_multiple(['212826594123710464', '293029505457586176', '624980994889613312', '205520907815485440', '195210774199664641'], function() {
        user.delete({}, false, function(err) {
          assert.ok(!err);
          data.get({}, 'user', false, function(err, docs) {
            assert.ok(!err);
            assert.equal(docs.length, 0);
            done();
          });
        });
      });
    });

  });

  describe('edit', function() {

    it('edit a users mcuuid', function(done) {
      user.get({discord: '212826594123710464'}, false, function(err, docs) {
        assert.ok(!err);
        assert.ok(docs);
        input = docs[0];
        input.mcName = 'The__TxT';
        user.edit(input, false, function(err, doc){
          assert.ok(!err);
          assert.ok(doc);
          assert.equal(doc.mcName, 'The__TxT');
          user.get({discord: '212826594123710464'}, {first: true}, function(err, doc) {
            assert.ok(!err);
            assert.ok(doc);
            assert.equal(doc.mcName, 'The__TxT');
            done();
          });
        });
      });
    });

  });

  describe('modify', function() {


  });

  describe('events', function() {


  });

});