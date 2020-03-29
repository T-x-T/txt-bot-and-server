//Contains all tests for the post component

//Dependencies
const post = require('../src/post');
const data = require('../src/data');
const assert = require('assert');

let input1 = {
  title: 'This is a test post',
  author: 'TxT',
  body: '<h1>TEST</h1><br>This was created from automated testing',
  date: Date.now(),
  public: true
};

let input2 = {
  title: 'This is a second test post',
  author: 'TxT',
  body: '<h1>TEST</h1><br>This was created from very automated testing',
  date: Date.now(),
  public: false
};

describe('post', function(){

  beforeEach('Delete all bulletins', function(done){
    data.delete({}, 'post', false, function(err){
      assert.ok(!err);
      done();
    });
  });

  describe('create', function(){

    it('create a new post', function(done){
      post.save(input1, false, function(err, doc){
        assert.ok(!err);
        assert.ok(doc);
        assert.equal(doc.title, input1.title);
        assert.equal(doc.date, input1.date);
        done();
      });
    });

  });

  describe('edit', function(){

    it('edit a post', function(done) {
      let input = input1;
      input.public = true;
      input.title = 'This is now public!'
      post.save(input, false, function(err, doc) {
        assert.ok(!err);
        assert.ok(doc);
        assert.equal(doc.title, input.title);
        assert.equal(doc.public, input.public);
        done();
      });
    });

  });

  describe('get', function(){
    
    it('get a single post', function(done){
      post.save(input1, false, function(err, doc) {
        assert.ok(!err);
        assert.ok(doc);
        post.get({id: 0}, {first: true}, function(err, doc){
          assert.ok(!err);
          assert.ok(doc);
          assert.equal(doc.title, input1.title);
          assert.equal(doc.date, input1.date);
          done();
        });
      });
    });

    it('get all posts with one saved', function(done) {
      post.save(input1, false, function(err, doc) {
        assert.ok(!err);
        assert.ok(doc);
        post.get({}, false, function(err, docs) {
          assert.ok(!err);
          assert.ok(docs);
          assert.equal(docs.length, 1);
          assert.equal(docs[0].title, input1.title);
          assert.equal(docs[0].date, input1.date);
          done();
        });
      });
    });

    it('get all posts with two saved', function(done) {
      post.save(input1, false, function(err, doc) {
        assert.ok(!err);
        assert.ok(doc);
        post.save(input2, false, function(err, doc) {
          assert.ok(!err);
          assert.ok(doc);
          post.get({}, false, function(err, docs) {
            assert.ok(!err);
            assert.ok(docs);
            assert.equal(docs.length, 2);
            assert.equal(docs[1].title, input2.title);
            assert.equal(docs[1].date, input2.date);
            done();
          });
        });
      });
    });

  });
});