/*
 *  UPDATER 
 *  This file contains all logic in regards to updating stats
 */

//Dependencies
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const data = require('../data');

//Create the container
var updater = {};

updater.update_mc_stats = function(){
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
        fs.readFile(path.join(__dirname, './../../mc_stats/' + file), 'utf8', function (err, fileData) {
          if (!err && fileData.length > 0) {
            //Read in some file which seems valid, try to parse it to an object
            let stats = false;
            try {
              stats = JSON.parse(fileData);
            } catch (e) {
              global.log(2, 'stats', 'read_mc_stats couldnt parse the new data', { err: e, data: fileData });
            }
            if (stats) {
              let final_stat = {
                uuid: uuid,
                stats: stats,
                sub_type: 's4',
                timestamp: Date.now()
              };

              data.new(final_stat, 'stats', false, function (err, doc) {
                if (err || !doc) global.log(2, 'stats', 'read_mc_stats couldnt parse the data read from disk', { err: e, data: fileData });
              });
            }
          } else {
            global.log(2, 'stats', 'read_mc_stats couldnt read the stats from disk', { err: err, file: file });
          }
        });
      });

    } else {
      global.log(2, 'stats', 'read_mc_stats couldnt read the files from the directory', { err: err });
    }
  });
};

//Export the container
module.exports = updater;