//Tests for YouTube component

//Dependencies
const assert = require('assert');
const youtube = require('../src/youtube');

describe('youtube', function(){

  let _video;

  it('get newest video for all channels', function(done){
    emitter.once('test_youtube_got_video', (video) => {
      assert.ok(video);
      assert.ok(video.hasOwnProperty('id'));
      assert.ok(video.hasOwnProperty('channel'));
      assert.ok(video.hasOwnProperty('url'));
      _video = video;
      done();
    });

    youtube.getNewestVideo();
  });

  it('emitter gets emitted on new video', function(done){
    global.newestVideos = {};
    let video = _video;
    video.date = Date.now();
    
    emitter.once('youtube_new', (newVideo) => {
      assert.ok(newVideo);
      assert.equal(video.id, newVideo.id);
      done();
    });

    youtube.postIfNew(video);
  });

  it('emitter doesnt get emitted on old video', function(done){
    global.newestVideos = {};
    let video = _video;
    video.date = new Date(Date.now() - (1000 * 60 * 60));
    
    emitter.once('youtube_new', (newVideo) => {
      assert.ok(false);
    });
    setTimeout(function(){
      done();
    }, 100);
    youtube.postIfNew(video);
  });

});