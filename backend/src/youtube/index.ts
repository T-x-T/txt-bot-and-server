/*
*  YOUTUBE API WRAPPER
*  Contains all functionallity for interacting with the youtube API
*/

//Dependencies
import https = require("https");
import discord_helpers = require("../discord_helpers/index.js");
import log = require("../log/index.js");
import {IncomingMessage} from "node:http";

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

let config: IConfigYoutube;
let newestVideos: {[channels: string]: IYoutubeVideo} = {};

export = {
  init(_config: IConfigYoutube) {
    config = _config;
  },

  checkForNewVideos() {
    const channels: IYoutubeChannel[] = config.youtube_video_announcements;
    channels.forEach((channel) => getNewestVideos(channel));
  }
}

function getNewestVideos(channel: IYoutubeChannel) {
  const options = {
    host: "www.googleapis.com",
    port: 443,
    path: `/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=${channel.youtube_id}&maxResults=1&fields=items&key=${config.google_api_key}`
  };
  
  https.get(options, function (res: IncomingMessage) {
    res.setEncoding("utf8");
    let rawData: string = "";
    res.on("data", function (chunk) {
      rawData += chunk;
    }).on("end", function () {
      //Parse the data object
      const data = JSON.parse(rawData);
      //Check if the response from youtube is valid
      if(data?.items[0]?.hasOwnProperty("contentDetails")) {
        //Data object seems valid
        postIfNew({
          id: data.items[0].contentDetails.upload.videoId,
          title: data.items[0].snippet.title,
          url: "https://youtu.be/" + data.items[0].contentDetails.upload.videoId,
          date: new Date(data.items[0].snippet.publishedAt),
          channel: channel,
          channel_title: data.items[0].snippet.channelTitle
        });
      } else {
        log.write(0, "youtube", "Retrieved data from youtube is invalid", data);
      }
    }).on("error", function (e) {
      log.write(2, "youtube", "Cant retrieve video data from youtube: " + e.message, null);
    });
  });
}

function postIfNew(video: IYoutubeVideo) {
  if(newestVideos.hasOwnProperty(video.channel.youtube_id)) {
    if(newestVideos[video.channel.youtube_id].id != video.id) {
      post(video);
      newestVideos[video.channel.youtube_id] = video;
    }
  } else {
    newestVideos[video.channel.youtube_id] = video;
    if(video.date > new Date(Date.now() - 5 * 60 * 1000)) {
      post(video);
    }
  }
}

function post(video: IYoutubeVideo) {
  discord_helpers.sendMessage(`New Video: ${video.title} by ${video.channel_title}\n${video.url}\n<@&${video.channel.role}>`, video.channel.channel_id)
    .catch((e: Error) => log.write(2, "youtube", "couldnt send the new youtube video message", {error: e.message, video: video}));
}