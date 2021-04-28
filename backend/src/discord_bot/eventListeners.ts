import discord_helpers = require("./helpers.js");

global.g.emitter.on('contact_new', (subject: string, text: string) => {
  discord_helpers.sendMessage(`Someone used the contact form!\nSubject: ${subject}\nBody: ${text}`, global.g.config.discord_bot.channel.new_application_announcement);
});

global.g.emitter.on('crash', (err: Error, origin: string) => {
  discord_helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, global.g.config.discord_bot.channel.logs);
});