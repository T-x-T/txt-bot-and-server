/*
*	COMMAND FILE FOR ADMIN COMMANDS
*	Command for all the admin thingys
*/

const mc_helpers = require("../../minecraft/index.js");
const auth = require("../../auth/index.js");
const MemberFactory = require("../../user/memberFactory.js");
const memberFactory = new MemberFactory({});
memberFactory.connect();

const ApplicationFactory = require("../../application/applicationFactory.js");
const applicationFactory = new ApplicationFactory({});
applicationFactory.connect(); 

import Discord = require("discord.js");
import type {Application} from "../../application/application.js";

module.exports = {
  name: 'admin',
  description: 'Commands only for admins',
  aliases: ['a'],

  execute(message: Discord.Message, args: string[]) {
    //Check if the author is admin
    if (auth.getAccessLevel({id: message.member.id}, null) >= 8) {
      //Check the first argument and execute it
      switch (args[0]) {
        case 'delete':
          //Define the amount of messages to be deleted
          const amount = parseInt(args[1]) + 1;

          //Check if its a real number
          if (isNaN(amount) || amount < 2) {
            message.channel.send('Thats not a real number');
          } else {
            //Bulk delete can only delete 100 messages at once, check if we are below that
            if (amount <= 100) {
              //Just delete the amount
              message.channel.bulkDelete(amount, false)
              .catch(err => {
                global.g.log(2, 'Admin Command: Bulk delete failed', { message: message.content, error: err });
                message.channel.send('Welp, that didnt work :(');
              });
            } else {
              for (var i = 0; i < amount; i += 50) {
                if (amount >= 50) {
                  message.channel.bulkDelete(50, false)
                  .catch(err => {
                    global.g.log(2, 'discord_bot', 'Admin Command: Mass bulk delete failed', { message: message.content, error: err });
                    message.channel.send('Welp, that didnt work :(');
                  });
                } else {
                  message.channel.bulkDelete(amount, false)
                  .catch(err => {
                    global.g.log(2, 'discord_bot', 'discord_bot', 'Admin Command: Mass bulk delete failed', { message: message.content, error: err });
                    message.channel.send('Welp, that didnt work :(');
                  });
                }
              }
            }
          }
          break;
        case 'inactivate':
          memberFactory.getByDiscordId(message.mentions.users.first().id)
            .then((member: any) => {
              member.inactivate()
                .then(() => {
                  member.save();
                  message.reply("success");
                })
                .catch((e: Error) => message.reply(e.message));
            })
            .catch((e: Error) => message.reply(e.message));
          break;
        case 'activate':
          memberFactory.getByDiscordId(message.mentions.users.first().id)
            .then((member: any) => {
              member.activate()
              .then(() => {
                member.save();
                message.reply("success");
              })
              .catch((e: Error) => message.reply(e.message));
            })
            .catch((e: Error) => message.reply(e.message));
          break;
        case 'exec':
          //Command to execute manual tasks
          switch(args[1]){
            case 'forceaccept':
              applicationFactory.getByDiscordId(message.mentions.users.first().id)
              .then((application: Application) => {
                if(application) application[0].acceptGuildMember()
                .then(() => message.reply("success"))
                .catch((e: Error) => message.reply(e.message));
                else message.reply("couldnt get application")
              })
              .catch((e: Error) => message.reply(e.message));
              break;
            default:
              message.reply('I didnt quite understand you moron');
              break;
          }
          break;
        case 'mc':
          switch(args[1]){
            case 'cmd':
              let server = args[2];
              let cmd = '';
              args[0] = '';
              args[1] = '';
              args[2] = '';
              args.forEach((arg) => {
                cmd += arg;
                cmd += ' ';
              });
              mc_helpers.sendCmd(cmd.trim(), server, (res: string) => {
                message.channel.send(res)
              });
              break;
          }
          break;
        default:
          //Paramater not found
          message.channel.send('Sorry, I cant find that paramater');
          break;
      }
    } else {
      message.channel.send('Sorry, you are not authorized to do that');
    }
  }
};

export default {}