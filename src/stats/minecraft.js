/*
 *  MINECRAFT STATS GETTERS
 *  Retrieval of stats from the database and filtering them after collections
 */

//Dependencies
const config = require('../../config.js');
const data = require('../data');
const user = require('../user');

//Create the container
var mc = {};

//Getters
mc.getRanked = function(collection, uuid, callback){
  getLatestStats(uuid, function(err, doc){
    if(!err && doc){
      //Get the collections data
      let stats = _statsTemplates[collection](doc);
  
      //Get stats from all players to create the ranking
      getLatestStats(false, function(err, docs){
        if(!err && docs){
          //Get the rank for each key in the stats
          let finalStats = {};
          for(let stat in stats){
            //Get an array of all users stat
            let allStats = [];
            for(let doc in docs){
              allStats.push(_statsTemplates.single(doc, stat));
            }

            //Sort the array
            allStats = allStats.sort(function(a, b){
              return b - a;
            });

            //Add the rank to the final array
            finalStats[stat] = {
              stat: stats[stat],
              rank: allStats.indexOf(parseInt(stats[stat])) + 1
            }
          }
        }else{
          callback('Couldnt get stats for all users: ' + err, false);
        }
      });
    }else{
      callback('Couldnt get stats for user: ' + uuid + err, false);
    }
  });
};

mc.getSingle = function(collection, uuid, callback){
  getLatestStats(uuid, function(err, doc){
    if(!err && doc){
      callback(_statsTemplates[collection](doc));
    }else{
      callback(err, false);
    }
  });
};

mc.getAll = function(collection, callback){
  getLatestStats(false, function(err, docs){
    if(!err && docs){
      callback(_statsTemplates[collection](sumArray(docs)));
    }else{
      callback(err, false);
    }
  });
};

function sumArray(docs){
  let finishedObject = {};
  for(let i = 0; i < docs.length; i++){
    for(let topkey in docs[i]){
      if(!finishedObject.hasOwnProperty(topkey)) finishedObject[topkey] = {};
      for(let key in docs[i][topkey]){
        finishedObject[topkey].hasOwnProperty(key) ? finishedObject[topkey][key] += docs[i][topkey][key] : finishedObject[topkey][key] = docs[i][topkey][key];
      }
    }
  }
  return finishedObject;
}

function getLatestStats(uuid, callback){
  let filter = uuid ? uuid : {};
  if(uuid){
    data.get(filter, 'stats', {type: 'mc_stats', latest: true}, function(err, doc){
      if(!err && doc){
        callback(false, doc);
      }else{
        callback(err, false);
      }
    });
  }else{
    user.get({}, {privacy: true, onlyPaxterians: true}, function(err, docs){
      if(!err && docs){
        let errored = false;
        let stats = [];
        for(let i = 0; i < docs.length; i++){
          getLatestStats(docs[i].mcUUID, function(err, doc){
            if(err) errored = err;
            stats.push(docs[i]);
            if(i == docs.length) callback(errored, stats);
          });
        }
      }else{
        callback(err, false);
      }
    });
  }
};


//Collections



//Export the container
module.exports = mc;