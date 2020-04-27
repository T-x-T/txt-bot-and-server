/*
 *  INDX FILE FOR DISCORD_BOT COMPONENT
 *  This component handles all discord bot functionality and is based on discordjs
 */

//Dependencies
const config = require('../../config.js');
const main = require('./main.js');
const discord_helpers = require('./helpers');


//Create the container
var index = {};

/*
 *  Functions
 */

index.init = function(){
  main.init();
};

index.getNicknameByID     = discord_helpers.getNicknameByID;
index.getMemberObjectByID = discord_helpers.getMemberObjectByID;
index.returnRoles         = discord_helpers.returnRoles;
index.returnRoleId        = discord_helpers.returnRoleId;
index.addMemberToRole     = discord_helpers.addMemberToRole;
index.updateAllNicks      = discord_helpers.updateAllNicks;
index.getAvatarUrl        = discord_helpers.getAvatarUrl;

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
    discord_helpers.sendMessage('New application from ' + doc.mc_ign + '\nhttps://paxterya.com/staff/application.html?id=' + doc.id, config['new_application_announcement_channel'], function(err){
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
    msg += 'The server IP is play.paxterya.com';
    
    discord_helpers.sendMessage(msg, config['new_member_announcement_channel'], function(err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the welcome message', {err: err, application: doc});
    });
  });
  
  emitter.on('bulletin_new', (msg) => {
    global.log(0, 'discord_bot', 'event bulletin_new received', {msg: msg});
    discord_helpers.sendMessage(msg, config['new_bulletin_announcement_channel'], function(err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the new bulletin message', {err: err, message: msg});
    });
  });
  
  emitter.on('bulletin_edit', (msg) => {
    global.log(0, 'discord_bot', 'event bulletin_edit received', {msg: msg});
    discord_helpers.sendMessage(msg, config['new_bulletin_announcement_channel'], function(err) {
      if(err) global.log(2, 'discord_bot', 'discord_bot couldnt send the edited bulletin message', {err: err, message: msg});
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
});


//Export the container
module.exports = index;