const discord_helpers = require("./helpers.js");

global.g.emitter.on('youtube_new', (video: any) => { //TODO: fix any
  global.g.log(0, 'discord_bot', 'event youtube_new received', {video: video});
  discord_helpers.sendMessage(`New Video: ${video.title} by ${video.channel_title}\n${video.url}\n<@&${video.channel.role}>`, video.channel.channel_id, function (err: Error) {
    if(err) {
      global.g.log(2, 'discord_bot', 'discord_bot couldnt send the new youtube video message', {err: err, video: video});
    }
  });
});

global.g.emitter.on('contact_new', (subject: string, text: string) => {
  discord_helpers.sendMessage(`Someone used the contact form!\nSubject: ${subject}\nBody: ${text}`, global.g.config.discord_bot.channel.new_application_announcement, function (_err: Error) {});
});

global.g.emitter.on('crash', (err: Error, origin: string) => {
  discord_helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, global.g.config.discord_bot.channel.logs, function (_err: Error) {});
});

export default {}