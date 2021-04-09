const discord_helpers = require('./helpers');

emitter.on('youtube_new', (video) => {
  global.log(0, 'discord_bot', 'event youtube_new received', {video: video});
  discord_helpers.sendMessage(`New Video: ${video.title} by ${video.channel_title}\n${video.url}\n<@&${video.channel.role}>`, video.channel.channel_id, function (err) {
    if(err) {
      global.log(2, 'discord_bot', 'discord_bot couldnt send the new youtube video message', {err: err, video: video});
    }
  });
});

emitter.on('contact_new', (subject, text) => {
  discord_helpers.sendMessage(`Someone used the contact form!\nSubject: ${subject}\nBody: ${text}`, config.discord_bot.channel.new_application_announcement, function (err) {});
});

emitter.on('crash', (err, origin) => {
  discord_helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, config.discord_bot.channel.logs, function (err) {});
});

//Modified from https://stackoverflow.com/a/9335296
function countdown(end) {
  let _second = 1000;
  let _minute = _second * 60;
  let _hour = _minute * 60;
  let _day = _hour * 24;
  let timer;
  let now = new Date();
  let distance = end - now;
  if(distance < 0) {
    clearInterval(timer);
    return 'Its over already :(';
  }
  let days = Math.floor(distance / _day);
  let hours = Math.floor((distance % _day) / _hour);
  let minutes = Math.floor((distance % _hour) / _minute);

  let output = days + 'days ';
  output += hours + 'hrs ';
  output += minutes + 'mins ';

  return output;
};