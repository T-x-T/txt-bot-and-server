//Tests for the data component

//Dependencies
const assert = require('assert');
const data = require('../src/data');

describe('data', function(){

  beforeEach(function(done){
    data.delete({}, 'test', false, function(err){
      done();
    });
  });

  //Saving
  describe('saving', function() {


    it('save a document', function(done) {
      data.new({id: 1, text: 'test'}, 'test', false, function(err, doc) {
        assert.ok(!err);
        assert.equal(doc.id, 1);
        assert.equal(doc.text, 'test');
        done();
      });
    });

    it('save and get 1k documents', function(done){
      for(let i = 0; i <= 1000; i++){
        data.new({id: i, text: 'test'}, 'test', false, function(err, doc) {
          assert.ok(!err);
          assert.equal(doc.id, i);
          assert.equal(doc.text, 'test');
          data.get({id: i}, 'test', false, function(err, doc) {
            doc = doc[0];
            assert.ok(!err);
            assert.equal(doc.id, i);
            assert.equal(doc.text, 'test');
            if(i === 1000) done();
          });
        });
      }
    });


  });

  //Getting
  describe('getting', function() {


    it('get a document by its id', function(done) {
      data.new({id: 1, text: 'test'}, 'test', false, function(a, b) {
        data.get({id: 1}, 'test', false, function(err, doc){
          doc = doc[0];
          assert.ok(!err);
          assert.equal(doc.id, 1);
          assert.equal(doc.text, 'test');
          done();
        });
      });
    });

    //Not implemented yet
/*     it('get a document by its id using first=true', function(done) {
      data.new({id: 1, text: 'test'}, 'test', false, function(a, b) {
        data.get({id: 1}, 'test', {first: true}, function(err, doc) {
          console.log(err, doc)
          assert.ok(!err);
          assert.equal(doc.id, 1);
          assert.equal(doc.text, 'test');
          done();
        });
      });
    }); */



  });

  //Editing
  describe('editing', function() {


    it('edit a document by its id', function(done) {
      data.new({id: 1, text: 'test'}, 'test', false, function(a, b) {
        b.text = 'bla';
        data.edit(b, 'test', false, function(c, d) {
          data.get({id: 1}, 'test', false, function(err, docs){
            let doc = docs[0];
            assert.ok(!err);
            assert.equal(doc.id, 1);
            assert.equal(doc.text, 'bla');
            done();
          });
        });
      });
    });



  });

  //Deleting
  describe('deleting', function() {


    it('delete all documents', function(done) {
      data.new({id: 1, text: 'test'}, 'test', false, function(err, doc) {
        data.delete({}, 'test', false, function(err){
          assert.ok(!err);
          data.get({id: 1}, 'test', false, function(err, docs) {
            assert.ok(!err);
            assert.equal(docs.length, 0);
            done();
          });
        });
      });
    });


  });


});