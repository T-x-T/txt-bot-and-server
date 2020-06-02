/*
 *  INDX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
const main = require('./main.js');
const discord_helpers = require('./helpers');
const _bulletin = require('../bulletin');

//Create the container
var index = {};

/*
 *  Functions
 */

index.getNicknameByID     = discord_helpers.getNicknameByID;
index.returnRoles         = discord_helpers.returnRoles;
index.returnRoleId        = discord_helpers.returnRoleId;
index.addMemberToRole     = discord_helpers.addMemberToRole;
index.updateAllNicks      = discord_helpers.updateAllNicks;

/*
 *  Event listeners
 */

//setImmediate because otherwise application wont load correctly
setImmediate(function(){
  const application = require('../application');

  emitter.on('application_accepted', (doc) => {
    global.log(0, 'discord_bot', 'event application_accepted received', {doc: doc});
    if(discord_helpers.isGuildMember(doc.discord_id)){
      application.acceptWorkflow(doc.discord_id, application);
    }
  });
  
  emitter.on('application_new', (doc) => {
    global.log(0, 'discord_bot', 'event application_new received', {doc: doc});
    discord_helpers.sendMessage('New application from ' + doc.mc_ign + '\nhttps://paxterya.com/application.html?id=' + doc.id, config.discord_bot.channel.new_application_announcement, function(err){
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new application message', {err: err, application: doc});
    });
  });
  
  emitter.on('application_accepted_joined', (doc) => {
    global.log(0, 'discord_bot', 'event application_accepted_joined received', {doc: doc});
    discord_helpers.addMemberToRole(doc.discord_id, discord_helpers.returnRoleId('paxterya'), function(err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt add accepted member to role', {application: doc, err: err});
    });
    discord_helpers.updateNick(doc.discord_id);
  
    let msg = '';
    if(doc.publish_about_me) msg = `Welcome <@${doc.discord_id}> to Paxterya!\nHere is the about me text they sent us:\n${doc.about_me}`;
      else msg = `Welcome <@${doc.discord_id}> to Paxterya!`;
    msg += '\n\nThis means you can now join the server! If you have any troubles please ping the admins!\n';
    msg += 'It is also a good time to give our rules a read: https://paxterya.com/rules \n';
    msg += 'Please also take a look at our FAQ: https://paxterya.com/faq \n';
    msg += 'The server IP is play.paxterya.com\n\n';
    msg += 'If you encounter any issues or have any questions, feel free to contact our mods (TestyMonkey, swabfu or MrSprouse) or the admins (ExxPlore or TxT).'
    discord_helpers.sendMessage(msg, config.discord_bot.channel.new_member_announcement, function(err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the welcome message', {err: err, application: doc});
    });
  });
  
  emitter.on('bulletin_new', (bulletin) => {
    global.log(0, 'discord_bot', 'event bulletin_new received', {bulletin: bulletin});
    
    _bulletin.getCategories({id: bulletin.category}, {first: true}, function(err, category){
      let msg = '';

      msg += `<@${bulletin.owner}> posted a new bulletin in ${category.name}:\n\n`;
      msg += bulletin.message + '\n\n';
      if(bulletin.event_date) msg += `The event happens on ${new Date(bulletin.event_date).toISOString().substring(0, 10)} (in ${countdown(new Date(bulletin.event_date))})\n`;
      if(bulletin.location_x || bulletin.location_x === 0) msg += `Coordinates: ${bulletin.location_x}/${bulletin.location_z}\n`;
      if(bulletin.item_names){
        msg += '```';
        for(let i = 0; i < bulletin.item_names.length; i++){
          msg += `item:  ${bulletin.item_amounts[i]} x ${bulletin.item_names[i]}\n`;
          msg += `price: ${bulletin.price_amounts[i]} x ${bulletin.price_names[i]}\n`;
          msg += '\n';
        }
        msg += '```';
      }
      if(category.discord_role) msg += `<@&${category.discord_role}>`;
      discord_helpers.sendMessage(msg, category.discord_channel, function(err) {
        if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new bulletin message', {err: err, message: msg});
      });
    });
  });
  
  emitter.on('bulletin_edit', (bulletin) => {
    global.log(0, 'discord_bot', 'event bulletin_edit received', {bulletin: bulletin});
    
    _bulletin.getCategories({id: bulletin.category}, {first: true}, function(err, category){
      let msg = '';

      msg += `<@${bulletin.owner}> edited a bulletin in ${category.name}:\n\n`;
      msg += bulletin.message + '\n\n';
      if(bulletin.event_date) msg += `The event happens on ${new Date(bulletin.event_date).toISOString().substring(0, 10)} (in ${countdown(new Date(bulletin.event_date))})\n`;
      if(bulletin.location_x || bulletin.location_x === 0) msg += `Coordinates: ${bulletin.location_x}/${bulletin.location_z}\n`;
      if(bulletin.item_names){
        msg += '```';
        for(let i = 0; i < bulletin.item_names.length; i++){
          msg += `item:  ${bulletin.item_amounts[i]} x ${bulletin.item_names[i]}\n`;
          msg += `price: ${bulletin.price_amounts[i]} x ${bulletin.price_names[i]}\n`;
          msg += '\n';
        }
        msg += '```';
      }

      discord_helpers.sendMessage(msg, category.discord_channel, function(err) {
        if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new bulletin message', {err: err, message: msg});
      });
    });
  });
  
  emitter.on('youtube_new', (video) => {
    global.log(0, 'discord_bot', 'event youtube_new received', {video: video});
    discord_helpers.sendMessage(`New Video: ${video.title} by ${video.channel_title}\n${video.url}\n<@&${video.channel.role}>`, video.channel.channel_id, function(err) {
      if(err) {
        global.log(2, 'discord_bot', 'discord_bot couldnt send the new youtube video message', {err: err, video: video});
      }
    });
  });

  emitter.on('contact_new', (subject, text) => {
    discord_helpers.sendMessage(`Someone used the contact form!\nSubject: ${subject}\nBody: ${text}`, config.discord_bot.channel.new_application_announcement, function(err){});
  });
});


//Export the container
module.exports = index;

//Modified from https://stackoverflow.com/a/9335296 could still be updated to allow dynamic updates of the timer
function countdown(end){
  let _second = 1000;
  let _minute = _second * 60;
  let _hour = _minute * 60;
  let _day = _hour * 24;
  let timer;
  let now = new Date();
  let distance = end - now;
  if (distance < 0) {
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