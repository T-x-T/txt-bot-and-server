/*
 *  UPDATER 
 *  This file contains all logic in regards to updating stats
 */

//Dependencies
const fs = require("fs");
const path = require("path");
const Persistable = require("../persistance/persistable.js");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;

let schema = {
  timestamp: Date,
  sub_type: String,
  uuid: String,
  stats: Mixed
};

module.exports = function () {
  read_mc_stats();
};

//Reads in stats from disk and puts them into the database
function read_mc_stats() {
  //Get all files from the directory
  fs.readdir(path.join(__dirname, './../../mc_stats/'), function (err, files) {
    if (!err) {
      //Lets read every file in
      files.forEach((file) => {

        //Get the uuid from the filename
        let uuid = file.replace('.json', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '');

        //Read the stats file for the current member
        fs.readFile(path.join(__dirname, './../../mc_stats/' + file), 'utf8', async function (err, fileData) {
          if (!err && fileData.length > 0) {
            //Read in some file which seems valid, try to parse it to an object
            let stats = false;
            try {
              stats = JSON.parse(fileData);
            } catch (e) {
              global.g.log(2, 'stats', 'read_mc_stats couldnt parse the new data', { err: e, data: fileData });
            }
            if (stats) {
              let final_stat = {
                uuid: uuid,
                stats: stats,
                sub_type: 's4',
                timestamp: Date.now()
              };

              let persistable = new Persistable({name: 'mcstats', schema: schema});
              await persistable.init();
              persistable.data = final_stat;

              persistable.create()
                .catch(e => global.g.log(2, 'stats', 'read_mc_stats encountered error while trying to save', {err: e.message, file: file}));
            }
          } else {
            global.g.log(2, 'stats', 'read_mc_stats couldnt read the stats from disk', { err: err, file: file });
          }
        });
      });

    } else {
      global.g.log(2, 'stats', 'read_mc_stats couldnt read the files from the directory', { err: err });
    }
  });
};

export default {}