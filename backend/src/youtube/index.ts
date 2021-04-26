/*
*  YOUTUBE API WRAPPER
*  Contains all functionallity for interacting with the youtube API
*/

import {IncomingMessage} from "node:http";

//Dependencies
const https = require("https");

interface IYoutubeChannel {
  youtube_id: string,
  channel_id: string,
  role: string
}

interface IYoutubeVideo {
  id: string,
  title: string,
  url: string,
  date: Date,
  channel: IYoutubeChannel,
  channel_title: string
}

//Create a global variable that contains the newest video for each channel
global.g.newestVideos = {};

const index = {
  //Check what the newest video is
  getNewestVideo() {
    let channels: IYoutubeChannel[] = global.g.config.youtube.youtube_video_announcements;
    channels.forEach((channel) => {
      index.checkIfNewVideos(channel);
    });
  },

  //Checks if the given channel has new videos, channel is the object containing youtube_id and channel_id
  checkIfNewVideos(channel: IYoutubeChannel) {
    var options = {
      host: 'www.googleapis.com',
      port: 443,
      path: `/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=${channel.youtube_id}&maxResults=1&fields=items&key=${global.g.config.youtube.google_api_key}`
    };
    https.get(options, function (res: IncomingMessage) {
      res.setEncoding('utf8');
      let data: any = '';
      res.on('data', function (chunk) {
        data += chunk;
      }).on('end', function () {
        //Parse the data object
        data = JSON.parse(data);
        //Check if the response from youtube is valid
        if(data.hasOwnProperty("items") && data.items[0]) {
          if(data.items[0].hasOwnProperty('contentDetails')) {
            //Data object seems valid
            let latestVideo: IYoutubeVideo = {
              id: data.items[0].contentDetails.upload.videoId,
              title: data.items[0].snippet.title,
              url: 'https://youtu.be/' + data.items[0].contentDetails.upload.videoId,
              date: new Date(data.items[0].snippet.publishedAt),
              channel: channel,
              channel_title: data.items[0].snippet.channelTitle
            };
            global.g.emitter.emit('test_youtube_got_video', latestVideo);
            index.postIfNew(latestVideo);
          } else {
            //Data object isnt valid
            global.g.log(3, 'youtube', 'Youtube: Retrieved data from youtube is invalid', data);
          }
        } else {
          //Data object isnt valid
          global.g.log(3, 'youtube', 'Youtube: Retrieved data from youtube is invalid', data);
        }
      }).on('error', function (e) {
        global.g.log(3, 'youtube', 'Youtube: Cant retrieve video data from youtube', null);
      });
    });
  },

  //Check if a given video is new
  postIfNew(video: IYoutubeVideo) {
    if(global.g.newestVideos.hasOwnProperty(video.channel.youtube_id)) {
      if(global.g.newestVideos[video.channel.youtube_id].id != video.id) {
        //there is a video stored and it is different
        global.g.emitter.emit('youtube_new', video);

        //Set newest video object to the current video
        global.g.newestVideos[video.channel.youtube_id] = video
      }
    } else {
      //there is no video stored; store it and check if the current video might be new
      global.g.newestVideos[video.channel.youtube_id] = video;
      if(video.date > new Date(Date.now() - 5 * 60 * 1000)) {
        //looks like its new
        global.g.emitter.emit('youtube_new', video);
      }
    }
  }
};

module.exports = index;

export default {}