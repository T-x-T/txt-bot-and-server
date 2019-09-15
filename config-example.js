/*
 *  EXAMPLE CONFIG FILE
 *  Copy this file and rename to config.js, then customize all options
 */


//Create the container
var conf = {
    'http-port': 3000,
    'https-port': 3001,
    'use-external-certs': true, //false for testing
    'cert-path': '/etc/letsencrypt/live/{Domain}/',
    'bot-prefix': '+',
    'bot-token': 'ENTER YOUR TOKEN HERE',
    'mongodb-url': 'mongodb://HOSTNAME/DATABASE',
    'guild': 'guild id goes here as a number',
    'admin-role': 'The role ID of the admin role goes here',
    'log-level': 1,
    'channelID': 'youtube channel ID here',
    'google-api-key': 'google api key here',
    'youtube-video-announcement-channel': 'channel id'
};

//Export the container
module.exports = conf;
