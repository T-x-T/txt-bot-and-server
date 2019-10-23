/*
 *  TESTING OF EXISTING FEATURES
 *  Testing library using mocha
 */

//Dependencies
const config = require('./../config.js');
const lib_log = require('./../lib/log.js');
const lib_data = require('./../lib/data.js');
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
    it('lib_data.createMember should be able to create a member', function(done){
      lib_data.createMember('000000000889613312', 'random_name', 1234, 0, false, function(err){
        assert.ok(!err);
        done();
      });
    });
    it('lib_data.getUserData should return valid data for the test user', function(done) {
      lib_data.getUserData('000000000889613312', function(err, userData){
        assert.equal(err, false);
        assert.equal(userData.discord, '000000000889613312');
        assert.equal(userData.mcName, 'random_name');
        assert.equal(userData.birthyear, 1234);
        assert.equal(userData.nationality, 0);
        assert.equal(userData.public, false);
        done();
      });
    });
    it('lib_data.updateUserData should be able to update users data', function(done){
      lib_data.getUserData('000000000889613312', function(err, userData){
        userData.mcName = 'another_name';
        lib_data.updateUserData(userData.discord, userData, function(err){
          assert.equal(err, false);
          assert.ok(userData.mcName == 'another_name');
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
      lib_data.getKarma('000000000889613312', function(err, karma){
        assert.equal(err, false);
        assert.ok(typeof(karma) == 'number');
        assert.equal(karma, 0);
        done();
      });
    });
    it('lib_data.updateKarma should update karma', function(done){
      lib_data.getKarma('000000000889613312', function(err, karma){
        lib_data.updateKarma('000000000889613312', karma + 1, function(err){
          lib_data.getKarma('000000000889613312', function(err, karma){
            assert.equal(err, false);
            assert.equal(karma, 1);
            done();
          });
        });
      });
    });
    it('lib_data.checkMemberExist should correctly tell if a member exists or not', function(done){
      lib_data.checkMemberExist('000000000889613312', false, function(exists){
        assert.equal(exists, true);
        lib_data.checkMemberExist('100000000889613312', false, function(exists){
          assert.equal(exists, false);
          done();
        });
      });
    });
    it('lib_data.removeMember should remove the test user', function(done){
      lib_data.removeMember('000000000889613312', function(err){
        assert.ok(!err);
        lib_data.checkMemberExist('000000000889613312', false, function(exists){
          assert.ok(!exists);
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


    //Tests for /lib/log.js
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
    it('mc_helpers.sumStats should properly sum two objects', function(done){
      let obj1 = {}, obj2 = {};
      obj1.x = {
        a: 1,
        b: 3
      };
      obj2.x = {
        b: 1,
        c: 5
      };
      let obj3 = mc_helpers.sumStats([obj1, obj2]);
      assert.equal(obj3.x.a, 1);
      assert.equal(obj3.x.b, 4);
      assert.equal(obj3.x.c, 5);
      done();
    });
    it('mc_helpers.sumOfObject should properly sum an object', function(done){
      assert.equal(mc_helpers.sumOfObject({a: 1, b: 2, c: 3}), 6);
      done();
    });
    it('mc_helpers.getStatTemplate should return a proper general stats object for the__txt', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'general', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.damageDealt, 'number');
        assert.equal(typeof stats.deaths, 'number');
        assert.equal(typeof stats.playtime, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper totals stats object for the__txt', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'totals', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.mined, 'number');
        assert.equal(typeof stats.dropped, 'number');
        assert.equal(typeof stats.traveled, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper topUsageItems stats object for the__txt', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'topDroppedItems', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.stats[0].value, 'number');
        assert.equal(typeof stats.stats[0].key, 'string');
        assert.equal(typeof stats.stats[5].value, 'number');
        assert.equal(typeof stats.stats[5].key, 'string');
        assert.equal(typeof stats.stats[9].value, 'number');
        assert.equal(typeof stats.stats[9].key, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper totals per death stats object for the__txt', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'totalPerDeath', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.mined, 'number');
        assert.equal(typeof stats.dropped, 'number');
        assert.equal(typeof stats.traveled, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper general stats object for all players', function(done){
      mc_helpers.getStatTemplate(false, 'general', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.damageDealt, 'number');
        assert.equal(typeof stats.deaths, 'number');
        assert.equal(typeof stats.playtime, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper totals stats object for all players', function(done){
      mc_helpers.getStatTemplate(false, 'totals', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.mined, 'number');
        assert.equal(typeof stats.dropped, 'number');
        assert.equal(typeof stats.traveled, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper topUsageItems stats object for all players', function(done){
      mc_helpers.getStatTemplate(false, 'topDroppedItems', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.stats[0].value, 'number');
        assert.equal(typeof stats.stats[0].key, 'string');
        assert.equal(typeof stats.stats[5].value, 'number');
        assert.equal(typeof stats.stats[5].key, 'string');
        assert.equal(typeof stats.stats[9].value, 'number');
        assert.equal(typeof stats.stats[9].key, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper totals per death stats object for all players', function(done){
      mc_helpers.getStatTemplate(false, 'totalPerDeath', false, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.mined, 'number');
        assert.equal(typeof stats.dropped, 'number');
        assert.equal(typeof stats.traveled, 'string');
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper general stats object for the__txt including ranks', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'general', true, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.damageDealt.stat, 'number');
        assert.equal(typeof stats.damageDealt.rank, 'number');
        assert.ok(typeof stats.damageDealt.rank != 0);
        assert.equal(typeof stats.deaths.stat, 'number');
        assert.equal(typeof stats.deaths.rank, 'number');
        assert.ok(typeof stats.deaths.rank != 0);
        assert.equal(typeof stats.playtime.stat, 'string');
        assert.equal(typeof stats.playtime.rank, 'number');
        assert.ok(typeof stats.playtime.rank != 0);
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper totals stats object for the__txt including ranks', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'totals', true, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.mined.stat, 'number');
        assert.equal(typeof stats.mined.rank, 'number');
        assert.ok(typeof stats.mined.rank != 0);
        assert.equal(typeof stats.dropped.stat, 'number');
        assert.equal(typeof stats.dropped.rank, 'number');
        assert.ok(typeof stats.dropped.rank != 0);
        assert.equal(typeof stats.traveled.stat, 'string');
        assert.equal(typeof stats.traveled.rank, 'number');
        assert.ok(typeof stats.traveled.rank != 0);
        done();
      });
    });
    it('mc_helpers.getStatTemplate should return a proper totals per death stats object for the__txt including ranks', function(done){
      mc_helpers.getStatTemplate('dac25e44d1024f3b819978ed62d209a1', 'totalPerDeath', true, function(err, stats){
        assert.ok(!err);
        assert.equal(typeof stats, 'object');
        assert.equal(typeof stats.mined.stat, 'number');
        assert.equal(typeof stats.mined.rank, 'number');
        assert.ok(typeof stats.mined.rank != 0);
        assert.equal(typeof stats.dropped.stat, 'number');
        assert.equal(typeof stats.dropped.rank, 'number');
        assert.ok(typeof stats.dropped.rank != 0);
        assert.equal(typeof stats.traveled.stat, 'string');
        assert.equal(typeof stats.traveled.rank, 'number');
        assert.ok(typeof stats.traveled.rank != 0);
        done();
      });
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
