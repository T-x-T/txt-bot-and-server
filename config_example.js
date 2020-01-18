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
    'paxterya-role': 'The role ID of the paxterya role goes here',
    'upload-role': 'The role ID of the upload role goes here',
    'log-level': 1,
    'channelID': 'youtube channel ID here',
    'google-api-key': 'google api key here',
    'youtube-video-announcement-channel': 'channel id',
    'mc-stats-remote': 'rclone remote name',
    'rcon-server': '',
    'rcon-port': 25575,
    'rcon-password': '',
    'mailUser': 'test@example.org',
    'mailPass': 'badPW123',
    'discord_client_id': '',
    'discord_client_secret': '',
    'discord_redirect_uri_application': '',
    'discord_redirect_uri_staffLogin': '',
    'new_member_announcement_channel': 'id of the channel new members get announced to',
    'new_application_announcement_channel': '',
    'oauth_uris': {
      'application': '',
      'login': ''
    }
};

//Export the container
module.exports = conf;
