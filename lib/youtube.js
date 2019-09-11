/*
 *  YOUTUBE API WRAPPER
 *  Contains all functionallity for interacting with the youtube API
 */
//Dependencies
const config = require('./../config.js');
const https = require('https');
const discordHelpers = require('./../discord-bot/discord-helpers.js');
const log = require('./log.js');

//Create the container
var youtube = {};

//Check what the newest video is
youtube.getNewestVideo = function () {
    var options = {
        host: 'www.googleapis.com',
        port: 443,
        path: `/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=UC3bXl38E3-KtJdXHBUKg_Dw&maxResults=1&fields=items&key=${config["google-api-key"]}`
    };
    https.get(options, function (res) {
        res.setEncoding('utf8');
        let data = '';
        res.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
            var latestVideo = {
                id: JSON.parse(data).items[0].contentDetails.upload.videoId,
                title: JSON.parse(data).items[0].snippet.title,
                url: 'https://youtu.be/' + JSON.parse(data).items[0].contentDetails.upload.videoId,
                date: new Date(JSON.parse(data).items[0].snippet.publishedAt)
            };
            youtube.postIfNew(latestVideo);
        }).on('error', function (e) {
            log.write(3, 'Youtube: Cant retrieve video data from youtube', {}, function (err) { });
        });
    });
};

//Check if a given video is new
youtube.postIfNew = function (video) {
    if (video.date > new Date(Date.now() - 2 * 60 * 1000)) {
        //Video was posted within the last two minutes - check if the last message in the channel is about the new video
        discordHelpers.getLastMessage(config["youtube-video-announcement-channel"], function (message) {
            if (message) {
                //Check if the message contains the last video id
                if (!message.includes(video.id)) {
                    //The last message does not contain the video id of the newest video -> make a post
                    discordHelpers.sendMessage(`New Video: ${video.title}\n${video.url}`, config["youtube-video-announcement-channel"], function (err) {
                        if (err) {
                            log.write(3, 'YouTube: Cant send message about new video', { Error: err }, function (err) { });
                        }
                    });
                }
            } else {
                log.write(3, 'YouTube: Couldnt find the last message', {}, function (err) { });
            }
        });
    }
};

//Export the container
module.exports = youtube;
