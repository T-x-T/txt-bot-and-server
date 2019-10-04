/*
 *  TESTING OF EXISTING FEATURES
 *  Testing library using mocha
 */

//Dependencies
const config = require('./../config.js');
const lib_log = require('./../lib/log.js');
const lib_data = require('./../lib/data.js');
const lib_perflog = require('./../lib/perfLog.js');
const webserver = require('./../web/webServer.js');
const youtube = require('./../lib/youtube.js');
const mc_helpers = require('./../lib/mc_helpers.js');

const assert = require('assert');
const http = require('http');
const https = require('https');

describe('Array', function() {
  describe('#indexOf()', function() {
    /*
    *
    * TESTS FOR /LIB/
    *
    */

    //Tests for /lib/data.js
    it('lib_data.getUserData should return valid data for the bot user', function(done) {
      lib_data.getUserData('624980994889613312', function(err, userData){
        assert.equal(err, false);
        assert.ok(typeof(userData) == 'object');
        assert.ok(userData.discord == '624980994889613312');
        assert.ok(JSON.stringify(userData).length > 10);
        done();
      });
    });
    it('lib_data.updateUserData should be able to update users data', function(done){
      lib_data.getUserData('624980994889613312', function(err, userData){
        userData.discord = '624980994889613312';
        lib_data.updateUserData(userData.discord, userData, function(err){
          assert.equal(err, false);
          assert.ok(userData.discord == '624980994889613312');
          done();
        });
      });
    });
    it('lib_data.listAllMembers should return an array with all members', function(done){
      lib_data.listAllMembers(function(members){
        assert.ok(typeof(members) == 'object');
        assert.ok(members.length > 2);
        done();
      })
    });
    it('lib_data.getKarma should get karma', function(done){
      lib_data.getKarma('624980994889613312', function(err, karma){
        assert.equal(err, false);
        assert.ok(typeof(karma) == 'number');
        assert.ok(karma > -1);
        assert.ok(karma < 1000);
        done();
      });
    });
    it('lib_data.updateKarma should update karma', function(done){
      lib_data.getKarma('624980994889613312', function(err, karma){
        lib_data.updateKarma('624980994889613312', karma, function(err){
          assert.equal(err, false);
          done();
        });
      });
    });
    it('lib_data.checkMemberExist should correctly tell if a member exists or not', function(done){
      lib_data.checkMemberExist('624980994889613312', false, function(exists){
        assert.equal(exists, true);
        lib_data.checkMemberExist('2398', false, function(exists){
          assert.equal(exists, false);
          done();
        });
      });
    });
    it('lib_data.getDB should return a valid databse connection', function(done){
      lib_data.getDB(function(err, con){
        assert.equal(err, false);
        assert.ok(typeof(con) == 'object');
        done();
      });
    });





    //Tests for /lib/graph.js
    //Nothing lol



    //Tests for /lib/log.js
    it('lib_log.write should log an event', function(done){
      lib_log.write(0, 'Test log', {}, function(err){
        assert.equal(err, false);
        lib_log.write(-1, 'Invalid test log', {}, function(err){
          assert.ok(err);
          lib_log.write(4, 'Invalid test log', {}, function(err){
            assert.ok(err);
            done();
          });
        });
      });
    });
    it('lib_log.read should return a log objects', function(done){
      lib_log.read(1, 0, function(data){
        assert.ok(data);
        assert.ok(typeof(data) == 'object');
        done();
      });
    });
    it('lib_log.readById should return a log object for a given id', function(done){
      lib_log.read(1, 0, function(data){
        lib_log.readById(data[0]._id, function(data2){
          assert.ok(data2 != false);
          assert.ok(typeof(data2) == 'object');
          assert.ok(data2._id.toString() == data[0]._id.toString());
          done();
        });
      });
    });



    //Tests for /lib/perfLog.js
    it('lib_perflog should log performance data to db and read it back', function(done){
      for(let i = 0; i < 100; i++){
        lib_perflog.execute();
      }
      setTimeout(function(){
        lib_perflog.getPerfLogs(new Date(Date.now() - 1000), function(data){
          assert.ok(typeof(data[0]) != 'undefined');
          assert.ok(data[0].memFreeMin > -1);
          assert.ok(data[0].memUsageAvg < 101);
          done();
        });
      }, 500);
    });



    //Tests for /lib/youtube.js
    it('HTTPS request to youtube api used in youtube.js to get activity of a channel should retrieve a JSON document', function(done){
      https.get({
        host: 'www.googleapis.com',
        port: 443,
        path: `/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=UC3bXl38E3-KtJdXHBUKg_Dw&maxResults=1&fields=items&key=${config["google-api-key"]}`
      }, function(res){
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
          assert.ok(data);
          assert.ok(data.indexOf('UC3bXl38E3-KtJdXHBUKg_Dw') > -1);
          done();
        });
      });
    });


    //Tests for /lib/mc_helpers.js
    it('mc_helpers.getUUID should return valid UUID', function(done){
      mc_helpers.getUUID('the__txt', function(uuid){
        assert.ok(uuid);
        assert.ok(uuid == 'dac25e44d1024f3b819978ed62d209a1');
        done();
      });
    });
    it('mc_helpers.getIGN should return valid IGN', function(done){
      mc_helpers.getIGN('dac25e44d1024f3b819978ed62d209a1', function(ign){
        assert.ok(ign);
        assert.ok(ign == 'The__TxT');
        done();
      });
    });
    it('mc_helpers.convertUUIDtoWeirdFormat should properly convert a uuid', function(done){
      assert.ok(mc_helpers.convertUUIDtoWeirdFormat('dac25e44d1024f3b819978ed62d209a1') == 'dac25e44-d102-4f3b-8199-78ed62d209a1');
      done();
    });
    it('mc_helpers.prettiyDistance should properly prettify dfferent distances', function(done){
      assert.equal(mc_helpers.prettiyDistance(0), '0cm');
      assert.equal(mc_helpers.prettiyDistance(99), '99cm');
      assert.equal(mc_helpers.prettiyDistance(100), '1m');
      assert.equal(mc_helpers.prettiyDistance(99949), '999m');
      assert.equal(mc_helpers.prettiyDistance(99950), '1km');
      assert.equal(mc_helpers.prettiyDistance(100000), '1km');
      done();
    });
    it('mc_helpers.prettifyDuration should properly prettidy different durations', function(done){
      assert.equal(mc_helpers.prettifyDuration(20 * 60 * 60), '1h');
      assert.equal(mc_helpers.prettifyDuration(20 * 60 * 30), '1h');
      assert.equal(mc_helpers.prettifyDuration(20 * 60 * 60 * 24), '24h');
      done();
    });
    /*
    *
    * TESTS FOR /DISCORD-BOT/
    *
    */







    /*
    *
    * TESTS FOR /WEB/
    *
    */
    //Start the web component
    youtube.getNewestVideo();
    webserver.init();

    it('HTTP request to localhost/landing on port from config should retrieve a html document', function(done){
      http.get({
        host: 'localhost',
        port: config['http-port'],
        path: '/landing'
      }, function(res){
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
          assert.ok(data);
          assert.ok(data.indexOf('I make videos on the interwebs.') > -1);
          done();
        });
      });
    });
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
    it('HTTPS request to localhost/landing on port from config should retrieve a html document', function(done){
      https.get({
        host: 'localhost',
        port: config['https-port'],
        path: '/landing'
      }, function(res){
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
          assert.ok(data);
          assert.ok(data.indexOf('I make videos on the interwebs.') > -1);
          done();
        });
      });
    });

    /*
    *
    * TESTS FOR /WORKERS/
    *
    */
    //Nothing to test
  });
});
