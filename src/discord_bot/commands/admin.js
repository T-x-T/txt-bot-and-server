/*
*	COMMAND FILE FOR ADMIN COMMANDS
*	Command for all the admin thingys
*/

const log = require('../../log');
const mc_helpers = require('../../minecraft');
const discord_helpers = require('../helpers.js');
const user = require('../../user');
const stats = require('../../stats');
const applications = require('../../application');
const auth = require('../../auth');

module.exports = {
  name: 'admin',
  description: 'Commands only for admins',
  aliases: ['a'],

  execute(message, args) {
    //Check if the author is admin
    if (auth.getAccessLevel({id: message.member.id}) >= 8) {
      //Check the first argument and execute it
      switch (args[0]) {
        case 'log':
          //Check if the user wants multiple entries or more info about a spefic one by checking if args[1] is a log id
          if (args[1].length > 10) {
            //The user wants details on a specific entry
            log.readById(args[1], function (err, data) {
              if (data != null) {
                var output = '```';
                output += data.timestamp.toString();
                output += '\n';
                output += data.name;
                output += '\n';
                if (data.data != null) output += JSON.stringify(data.data);
                output += '\n\n';
                output += '```';

                //Send the output
                message.channel.send(output);
              } else {
                message.channel.send('I cant really find that entry, Im sorry ;(');
              }
            });
          } else {
            if (args[1] == 'stats') {
              //The user wants general statistics on logs in a given period
              //Check how far back logs should be checked
              let minutes = 0;
              if (args[2].endsWith('m')) {
                minutes = parseInt(args[2]);
              } else {
                if (args[2].endsWith('h')) {
                  minutes = parseInt(args[2]) * 60;
                } else {
                  minutes = parseInt(args[2]) * 24 * 60;
                }
              }
              //Calculate the date at which we want to start getting logs
              let timespan = new Date(Date.now() - minutes * 60000);

              //Get all log entries from the given period
              log.read(false, timespan, function (err, data) {
                if (data.length > 0) {
                  //Do something with the data
                  //Define everything we want to count
                  let countDebug = 0;
                  let countInfo = 0;
                  let countWarn = 0;
                  let countError = 0;

                  //Iterate over the data array
                  data.forEach((entry) => {
                    //Check the level of the entry
                    switch (entry.level) {
                      case 0:
                        countDebug += 1;
                        break;
                      case 1:
                        countInfo += 1;
                        break;
                      case 2:
                        countWarn += 1;
                        break;
                      case 3:
                        countError += 1;
                        break;
                    }
                  });
                  //Form the output
                  let output = '```';
                  output += `I counted a total of ${data.length} log entries! In detail these are\n`;
                  if (countDebug != 0) output += `${countDebug} debug messages,\n`;
                  if (countInfo != 0) output += `${countInfo} informational messages,\n`;
                  if (countWarn != 0) output += `${countWarn} warnings,\n`;
                  if (countError != 0) output += `${countError} errors\n`;
                  output += '```';

                  //Send the message
                  message.channel.send(output);

                } else {
                  message.channel.send('I couldnt find any logs in the given period');
                }
              });
            } else {
              //The user wants all entries of a given log type in a given period
              var level = args[1] >= 0 && args[1] <= 3 ? args[1] : 3;
              if (typeof args[2] != 'undefined') {
                //Check how far back logs should be displayed
                var minutes = 0;
                if (args[2].endsWith('m')) {
                  minutes = parseInt(args[2]);
                } else {
                  if (args[2].endsWith('h')) {
                    minutes = parseInt(args[2]) * 60;
                  } else {
                    minutes = parseInt(args[2]) * 24 * 60;
                  }
                }
                //Calculate the date at which we want to start getting logs
                var timespan = new Date(Date.now() - minutes * 60000);

                //Get the log entries after the timespan date and with the given log-level
                log.read(level, timespan, function (err, data) {
                  if (data.length > 0) {
                    let output = '```';
                    output += `There are ${data.length} entries!\n\n`;
                    //Check if we are below 10 entries
                    if (data.length <= 10) {
                      //Less or equal to messages, no need to split it up!
                      for (let i = 0; i < data.length; i++) {
                        output += data[i].timestamp.toString();
                        output += '\n';
                        output += data[i].name;
                        output += '\n';
                        output += data[i]._id;
                        output += '\n\n';
                      }
                      output += '```';

                      //Send the message
                      message.channel.send(output);
                    } else {
                      let output = '';
                      //More than 10 messages, we need to split it up
                      for (var j = 0; j < data.length; j += 10) {
                        output = '```';
                        output += `Entries ${j} to ${j + 10 < data.length ? j + 10 : data.length} from ${data.length}:\n\n`;
                        for (let i = j; i < j + 10 && i < data.length; i++) {
                          output += data[i].timestamp.toString();
                          output += '\n';
                          output += data[i].name;
                          output += '\n';
                          output += data[i]._id;
                          output += '\n\n';
                        }
                        output += '```';

                        //Send the message
                        message.channel.send(output);
                      }
                    }
                  } else {
                    message.channel.send('Couldnt find anything');
                  }
                });
              } else {
                message.channel.send('The specified Date doesnt make any sense');
              }
            }
          }
          break;
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
                global.log(2, 'Admin Command: Bulk delete failed', { message: message.content, error: err });
                message.channel.send('Welp, that didnt work :(');
              });
            } else {
              for (var i = 0; i < amount; i += 50) {
                if (amount >= 50) {
                  message.channel.bulkDelete(50, false)
                  .catch(err => {
                    global.log(2, 'discord_bot', 'Admin Command: Mass bulk delete failed', { message: message.content, error: err });
                    message.channel.send('Welp, that didnt work :(');
                  });
                } else {
                  message.channel.bulkDelete(amount, false)
                  .catch(err => {
                    global.log(2, 'discord_bot', 'discord_bot', 'Admin Command: Mass bulk delete failed', { message: message.content, error: err });
                    message.channel.send('Welp, that didnt work :(');
                  });
                }
              }
            }
          }
          break;
        case 'exec':
          //Command to execute manual tasks
          switch(args[1]){
            case 'updatenicks':
              //Updates all minecraft IGNs
              user.updateNicks();
              break;
            case 'updatestats':
              stats.updateMcStats();
              break;
            case 'updateallnicks':
              discord_helpers.updateAllNicks();
              break;
            case 'fixapp':
              fixapp(message, message.mentions.users.first().id);
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
              mc_helpers.sendCmd(cmd.trim(), server, (res) => {
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

function fixapp(message, discord_id){
  applications.get({discord_id: discord_id}, {first: true, archieved: true}, (err, doc) => {
    if(err != 200 && err === true || !doc){
      message.reply(err);
      return;
    }

    doc.status = 1;
    applications.save(doc, {force: true}, (err) => {
      if(err != 200 && err === true || !doc){
        message.reply(err);
        return;
      }

      doc.status = 3;
      applications.save(doc, false, (err) => {
        if(err != 200 && err === true || !doc){
          message.reply(err);
          return;
        }

        message.reply('I fixed it');
        return;
      });
    });
  });
};