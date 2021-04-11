const discord_helpers = require("./helpers.js");

global.g.emitter.emit('youtube_new', (video) => {
  global.g.log(0, 'discord_bot', 'event youtube_new received', {video: video});
  discord_helpers.sendMessage(`New Video: ${video.title} by ${video.channel_title}\n${video.url}\n<@&${video.channel.role}>`, video.channel.channel_id, function (err) {
    if(err) {
      global.g.log(2, 'discord_bot', 'discord_bot couldnt send the new youtube video message', {err: err, video: video});
    }
  });
});

global.g.emitter.emit('contact_new', (subject, text) => {
  discord_helpers.sendMessage(`Someone used the contact form!\nSubject: ${subject}\nBody: ${text}`, global.g.config.discord_bot.channel.new_application_announcement, function (err) {});
});

global.g.emitter.emit('crash', (err, origin) => {
  discord_helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, global.g.config.discord_bot.channel.logs, function (err) {});
});

export default {}