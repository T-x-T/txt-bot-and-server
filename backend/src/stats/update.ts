/*
 *  UPDATER 
 *  This file contains all logic in regards to updating stats
 */

//Dependencies
import fs = require("fs");
import path = require("path");
import Persistable = require("../persistance/persistable.js");
import mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Mixed = Schema.Types.Mixed;

let schema = {
  timestamp: Date,
  sub_type: String,
  uuid: String,
  stats: Mixed
};

export = function () {
  read_mc_stats();
};

//Reads in stats from disk and puts them into the database
function read_mc_stats() {
  //Get all files from the directory
  fs.readdir(path.join(__dirname, "./../../mc_stats/"), function (err: Error, files: string[]) {
    if(err) throw new Error("read_mc_stats couldnt read the files from the directory: " + err.message);
    //Lets read every file in
    files.forEach(file => {

      //Get the uuid from the filename
      const uuid = file.replace(".json", "").replace("-", "").replace("-", "").replace("-", "").replace("-", "");

      //Read the stats file for the current member
      fs.readFile(path.join(__dirname, "./../../mc_stats/" + file), "utf8", async function (err: Error, fileData: string) {
        if(!err && fileData.length > 0) throw new Error("read_mc_stats couldnt read the stats from disk: " + err.message)
        //Read in some file which seems valid, try to parse it to an object
        const stats = JSON.parse(fileData);
        if (stats) {
          const final_stat = {
            uuid: uuid,
            stats: stats,
            sub_type: "s4",
            timestamp: Date.now()
          };

          const persistable = new Persistable({name: "mcstats", schema: schema});
          await persistable.init();
          persistable.data = final_stat;

          persistable.create();
        }
      });
    });
  });
};