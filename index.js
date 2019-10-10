/*
 *  INDEX FILE
 *  for starting all components
 */

//Dependencies
const data = require('./lib/data.js');
const config = require('./config.js');
const webServer = require('./web/webServer.js');
const discordBot = require('./discord-bot/discord-bot.js');
const log = require('./lib/log.js');
const workers = require('./workers/workers.js');
const { exec } = require('child_process');
//Log that the app got started
log.write(1, 'Application started', null, function (err) {
    if (err) {
        console.log('Error writing log: ' + err);
    }
});

//Create the container
var app = {};

//Init
app.init = function () {
    //Mount the stats from the minecraft sftp server to ./mc_stats
    exec(`rclone mount ${config['mc-stats-remote']}:./ ./mc_stats`, (err, stdout, stderr) => {
      if (err) {
        log.write(3, 'Couldnt start the process to mount the sftp server', {error: err}, function(err){});
        console.log('Couldnt start the process to mount the sftp server');
        return;
      }
    });
    webServer.init();
    discordBot.init();
};

//Call init
app.init();

//Export the container
module.exports = app;
