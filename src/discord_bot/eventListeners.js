const _bulletin = require('../bulletin');
const discord_helpers = require('./helpers');

emitter.on('bulletin_new', (bulletin) => {
  global.log(0, 'discord_bot', 'event bulletin_new received', {bulletin: bulletin});

  _bulletin.getCategories({id: bulletin.category}, {first: true}, function (err, category) {
    let msg = '';

    msg += `<@${bulletin.owner}> posted a new bulletin in ${category.name}:\n\n`;
    msg += bulletin.message + '\n\n';
    if(bulletin.event_date) msg += `The event happens on ${new Date(bulletin.event_date).toISOString().substring(0, 10)} (in ${countdown(new Date(bulletin.event_date))})\n`;
    if(bulletin.location_x || bulletin.location_x === 0) msg += `Coordinates: ${bulletin.location_x}/${bulletin.location_z}\n`;
    if(bulletin.item_names) {
      msg += '```';
      for(let i = 0; i < bulletin.item_names.length; i++) {
        msg += `item:  ${bulletin.item_amounts[i]} x ${bulletin.item_names[i]}\n`;
        msg += `price: ${bulletin.price_amounts[i]} x ${bulletin.price_names[i]}\n`;
        msg += '\n';
      }
      msg += '```';
    }
    if(category.discord_role) msg += `<@&${category.discord_role}>`;
    discord_helpers.sendMessage(msg, category.discord_channel, function (err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new bulletin message', {err: err, message: msg});
    });
  });
});

emitter.on('bulletin_edit', (bulletin) => {
  global.log(0, 'discord_bot', 'event bulletin_edit received', {bulletin: bulletin});

  _bulletin.getCategories({id: bulletin.category}, {first: true}, function (err, category) {
    let msg = '';

    msg += `<@${bulletin.owner}> edited a bulletin in ${category.name}:\n\n`;
    msg += bulletin.message + '\n\n';
    if(bulletin.event_date) msg += `The event happens on ${new Date(bulletin.event_date).toISOString().substring(0, 10)} (in ${countdown(new Date(bulletin.event_date))})\n`;
    if(bulletin.location_x || bulletin.location_x === 0) msg += `Coordinates: ${bulletin.location_x}/${bulletin.location_z}\n`;
    if(bulletin.item_names) {
      msg += '```';
      for(let i = 0; i < bulletin.item_names.length; i++) {
        msg += `item:  ${bulletin.item_amounts[i]} x ${bulletin.item_names[i]}\n`;
        msg += `price: ${bulletin.price_amounts[i]} x ${bulletin.price_names[i]}\n`;
        msg += '\n';
      }
      msg += '```';
    }

    discord_helpers.sendMessage(msg, category.discord_channel, function (err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new bulletin message', {err: err, message: msg});
    });
  });
});

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
  discord_helpers.sendMessage(`HELP I crashed:\n${err.stack}\n\n${origin}`, config.discord_bot.channel.new_application_announcement, function (err) {});
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