/*
*  YOUTUBE API WRAPPER
*  Contains all functionallity for interacting with the youtube API
*/
//Dependencies
const https = require('https');

//Create the container
var youtube = {};

//Create a global variable that contains the newest video for each channel
global.newestVideos = {};

//Check what the newest video is
youtube.getNewestVideo = function () {
  let channels = config["youtube-video-announcements"];
  channels.forEach((channel) => {
    youtube.checkIfNewVideos(channel);
  });
};

//Checks if the given channel has new videos, channel is the object containing youtube_id and channel_id
youtube.checkIfNewVideos = function(channel){
  var options = {
    host: 'www.googleapis.com',
    port: 443,
    path: `/youtube/v3/activities?part=snippet%2CcontentDetails&channelId=${channel.youtube_id}&maxResults=1&fields=items&key=${config["google-api-key"]}`
  };
  https.get(options, function(res) {
    res.setEncoding('utf8');
    let data = '';
    res.on('data', function(chunk) {
      data += chunk;
    }).on('end', function() {
      //Parse the data object
      data = JSON.parse(data);
      //Check if the response from youtube is valid
      if(data['items']) {
        if(data.items[0].hasOwnProperty('contentDetails')) {
          //Data object seems valid
          let latestVideo = {
            id: data.items[0].contentDetails.upload.videoId,
            title: data.items[0].snippet.title,
            url: 'https://youtu.be/' + data.items[0].contentDetails.upload.videoId,
            date: new Date(data.items[0].snippet.publishedAt),
            channel: channel,
            channel_title: data.items[0].snippet.channelTitle
          };
          emitter.emit('test_youtube_got_video', latestVideo);
          youtube.postIfNew(latestVideo);
        } else {
          //Data object isnt valid
          global.log(3, 'youtube', 'Youtube: Retrieved data from youtube is invalid', data);
        }
      } else {
        //Data object isnt valid
        global.log(3, 'youtube', 'Youtube: Retrieved data from youtube is invalid', data);
      }
    }).on('error', function(e) {
      global.log(3, 'youtube', 'Youtube: Cant retrieve video data from youtube', null);
    });
  });
};

//Check if a given video is new
youtube.postIfNew = function (video) {
  if(global.newestVideos.hasOwnProperty(video.channel.youtube_id)) {
    if(global.newestVideos[video.channel.youtube_id].id != video.id){
      //there is a video stored and it is different
      emitter.emit('youtube_new', video);

      //Set newest video object to the current video
      global.newestVideos[video.channel.youtube_id] = video
    }
  }else{
    //there is no video stored; store it and check if the current video might be new
    global.newestVideos[video.channel.youtube_id] = video;
    if(video.date > new Date(Date.now() - 5 * 60 * 1000)) {
      //looks like its new
      emitter.emit('youtube_new', video);
    }
  }
};

//Export the container
module.exports = youtube;
