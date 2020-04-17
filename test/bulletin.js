//Tests for the data component

//Dependencies
const config = require('../config');
const assert = require('assert');
const data = require('../src/data');
const bulletin = require('../src/bulletin');

const input1 = {
  author: '293029505457586176',
  message: 'This is a message posted for the purpose of automatic testing. This one contains nothing special.'
};

const input2 = {
  author: '212826594123710464',
  message: 'This is a message posted for the purpose of automatic testing. This one contains nothing special.'
};

function run(i, max, input, callback) {
  bulletin.save(input, false, function(err, doc) {
    if(i < config.bulletin['max_per_usr']) {
      assert.ok(!err);
      assert.ok(doc);
      assert.equal(doc.author, input.author);
      assert.equal(doc.message, input.message);
    } else {
      assert.ok(err);
      assert.ok(!doc);
    }
    i++;
    if(i <= max) run(i, max, input, callback);
    else callback();
  });
}

describe('bulletin', function(){

  beforeEach(function(done){
    data.delete({}, 'bulletin', false, function(err){
      done();
    });
  });


  //Saving
  describe('saving', function() {


    it('saving doesnt error', function(done){
      bulletin.save(input1, false, function(err, doc){
        assert.ok(!err);
        assert.ok(doc);
        assert.equal(doc.author, input1.author);
        assert.equal(doc.message, input1.message);
        done();
      });
    });

    it('saving max count bulletins', function(done){
      run(0, config.bulletin['max_per_usr'], input1, function() {
        done();
      });
    });

    it('saving one more than max count bulletins', function(done){
      run(0, config.bulletin['max_per_usr'], input1, function(){
        bulletin.save(input1, false, function(err, doc) {
          assert.ok(err);
          done();
        });
      });
    });

    it('saving 100 more than max count bulletins', function(done) {
      run(0, config.bulletin['max_per_usr'] + 100, input1, function() {
        done();
      });
    });

    it('saving max count bulletins for two users', function(done) {
      run(0, config.bulletin['max_per_usr'], input1, function() {
        run(0, config.bulletin['max_per_usr'], input2, function() {
          done();
        });
      });
    });

    it('saving max count bulletins for the first and one more for the second user', function(done) {
      run(0, config.bulletin['max_per_usr'], input1, function(){
        bulletin.save(input2, false, function(err, doc) {
          assert.ok(!err);
          assert.ok(doc);
          done();
        });
      });
    });

  });

  //Getting
  describe('getting', function() {

    it('get all bulletins with one saved', function(done){
      bulletin.save(input1, false, function(err, doc) {
        bulletin.get({}, false, function(err, docs){
          assert.ok(!err);
          assert.ok(docs);
          assert.equal(docs[0].author, input1.author);
          assert.equal(docs[0].message, input1.message);
          assert.equal(docs.length, 1);
          done();
        });
      });
    });

    it('get all bulletins with max number saved', function(done) {
      run(0, config.bulletin['max_per_usr'], input1, function() {
        bulletin.get({}, false, function(err, docs) {
          assert.ok(!err);
          assert.ok(docs);
          assert.equal(docs[config.bulletin['max_per_usr'] - 1].author, input1.author);
          assert.equal(docs[config.bulletin['max_per_usr'] - 1].message, input1.message);
          assert.equal(docs[0].author, input1.author);
          assert.equal(docs[0].message, input1.message);
          assert.equal(docs.length, config.bulletin['max_per_usr']);
          done();
        });
      });
    });

    it('get all bulletins with max number from two users saved', function(done) {
      run(0, config.bulletin['max_per_usr'], input1, function() {
        run(0, config.bulletin['max_per_usr'], input2, function() {
          bulletin.get({}, false, function(err, docs){
            assert.ok(!err);
            assert.ok(docs);
            assert.ok(docs[config.bulletin['max_per_usr'] - 1].author == input1.author || docs[config.bulletin['max_per_usr'] - 1].author == input2.author);
            assert.ok(docs[config.bulletin['max_per_usr'] - 1].message == input1.message || docs[config.bulletin['max_per_usr'] - 1].message == input2.message);
            assert.ok(docs[config.bulletin['max_per_usr'] * 2 - 1].author == input1.author || docs[config.bulletin['max_per_usr'] * 2 - 1].author == input2.author);
            assert.ok(docs[config.bulletin['max_per_usr'] * 2 - 1].message == input1.message || docs[config.bulletin['max_per_usr'] * 2 - 1].message == input2.message);
            assert.ok(docs[0].author == input1.author || docs[0].author == input2.author);
            assert.ok(docs[0].message == input1.message || docs[0].message == input2.message);
            assert.equal(docs.length, config.bulletin['max_per_usr'] * 2);
            done();
          });
        });
      });
    });

  });

  //Editing
  describe('editing', function() {
    
    beforeEach(function(done){
      bulletin.save(input1, false, function(err, doc){
        output = doc;
        assert.ok(!err);
        assert.ok(doc);
        done();
      });
    });

    it('editing a bulletin with matching authors', function(done){
      let input = {
        author: input1.author,
        message: 'edit',
        editAuthor: input1.author
      };
      bulletin.save(input, false, function(err, doc){
        assert.ok(!err);
        assert.ok(doc);
        assert.equal(doc.author, input1.author);
        assert.equal(doc.message, input.message);
        done();
      });
    });

    it('editing a bulletin with different authors (no admin)', function(done) {
      let input = {
        author: input1.author,
        message: 'edit',
        editAuthor: '000',
        _id: output._id
      };
      bulletin.save(input, false, function(err, doc) {
        assert.ok(err);
        done();
      });
    });

    it('editing a bulletin with different authors (admin)', function(done) {
      let input = {
        author: input1.author,
        message: 'edit',
        editAuthor: input2.author,
        _id: output._id
      };
      bulletin.save(input, false, function(err, doc) {
        assert.ok(!err);
        done();
      });
    });

  });

  //Deleting
  describe('deleting', function() {
    let output;
    beforeEach(function(done){
      bulletin.save(input1, false, function(err, doc){
        assert.ok(!err);
        assert.ok(doc);
        output = doc;
        done();
      });
    });

    it('deleting your own bulletin', function(done){
      output.deleteAuthor = input1.author;
      bulletin.delete(output, false, function(err){
        assert.ok(!err);
        done();
      });
    });

    it('deleting another bulletin (no admin)', function(done){
      let input = output;
      input.deleteAuthor = input.author - 1
      bulletin.delete(input, false, function(err) {
        assert.ok(err);
        done();
      });
    });

    it('deleting another bulletin (admin)', function(done) {
      let input = output;
      input.deleteAuthor = input2.author
      bulletin.delete(input, false, function(err) {
        assert.ok(!err);
        done();
      });
    });

  });


});