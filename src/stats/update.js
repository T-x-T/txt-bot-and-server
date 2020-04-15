/*
 *  UPDATER 
 *  This file contains all logic in regards to updating stats
 */

//Dependencies
const config = require('../../config.js');

//Create the container
var updater = {};

updater.update_mc_stats = function(){
  //Download all stats from the remote
  download_mc_stats();
  //Wait one second before reading the stats, so we can be sure they are done downloading
  setTimeout(function(){
    read_mc_stats();
  }, 1000);
};

//Downloads all stats from the server
function download_mc_stats(){
  void(exec(`rclone copy ${config['mc-stats-remote']}:/stats ./mc_stats`), (err, stdout, stderr) => {
    if (err) {
      global.log(2, 'Couldnt start the process to mount the sftp server', {error: err});
    }
  });
};

//Reads in stats from disk and puts them into the database
function read_mc_stats(){
  //Get all files from the directory
  fs.readdir(path.join(__dirname, './../../mc_stats/'), function (err, files) {
    if (!err) {
      //Lets read every file in
      files.forEach((file) => {
        //Check if we already logged this file by comparing write times
        fs.stat(path.join(__dirname, './../../mc_stats/' + file), function (err, stats) {
          if (!err) {
            let fileWriteTime = stats.mtimeMs;
            //Get the uuid from the filename
            let uuid = file.replace('.json', '').replace('-', '').replace('-', '').replace('-', '').replace('-', '');
            data.getLastTimestampMcStats(uuid, function (dbWriteTime) {
              //Compare both timestamps
              if (new Date(dbWriteTime).getTime() < fileWriteTime) {
                //DB version is older
                //Read the stats file for the current member
                fs.readFile(path.join(__dirname, './../../mc_stats/' + file), 'utf8', function (err, fileData) {
                  if (!err && fileData.length > 0) {
                    //Read in some file which seems valid, try to parse it to an object
                    let stats = false;
                    try {
                      stats = JSON.parse(fileData);
                    } catch (e) {
                      global.log(2, 'mc_helpers.updateStats couldnt save the new data', { err: e, data: fileData });
                    }
                    if (stats) {
                      data.addMcStats(uuid, stats, function (err) {
                        if (err) global.log(2, 'mc_helpers.updateStats couldnt parse the data read from disk', { err: e, data: fileData });
                      });
                    }
                  } else {
                    global.log(2, 'mc_helpers.updateStats couldnt read the stats from disk', { err: err, file: file });
                  }
                });
              }
            });
          } else {
            global.log(2, 'mc_helpers.updateStats couldnt read the modified data of the file', { err: err, mcUUID: member.mcUUID });
          }
        });
      });
    } else {
      global.log(2, 'mc_helpers.updateStats couldnt read the files from the directory', { err: err });
    }
  });
};

//Export the container
module.exports = updater;