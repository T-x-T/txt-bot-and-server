/*
 *	COMMAND FILE FOR ROLES
 *	With this command users can manage their role membership for certain roles
 */

const discordHelpers = require('./../discord-helpers.js');
const config = require('./../../config.js');
const log = require('./../../lib/log.js');

module.exports = {
    name: 'role',
    description: 'Used to change roles',
    aliases: ['roles'],
    usage: '[mention user OR top]',
    execute(message, args) {

        //Check if the user want to add, remove or list roles
        switch(args[0]){
          case 'add':
            //Check if the supplied role exists
            let valid = false;
            discordHelpers.getRoles().forEach((item) => {
              if(item.name == '#' + args[1]) valid = true;
            });
            if(valid){
              //Role exists, add it
              message.member.addRole(discordHelpers.getRoleId('#' + args[1]))
              .then(message.reply(`Welcome in the ${args[1]} role!`))
              .catch(log.write(2, 'Role Command: Couldnt add user into role', {Message: message.text}, function(e){}));
            }else{
              //Role doesnt exist
              message.reply('That role doesnt exist :(')
            }
            break;


          case 'remove':
            let roleId = discordHelpers.getRoleId('#' + args[1]);
            let count = 0;
            message.member.roles.map(function(item){
              if(item.id.indexOf(roleId) > -1){
                message.member.removeRole(roleId);
                message.channel.send('Success!');
                count++;
              }
            });
            if(count == 0) message.channel.send('That didnt work');
            break;


          case 'list':
            let output = '```\n';

            //Print all available roles
            output += 'Available roles:\n'
            discordHelpers.getRoles().forEach((item) => {
              output += item.name[0] == '#'? item.name.slice(1) : item.name;
              output += '\n';
            });

            //Print all roles of the user
            output += '\n\nYour roles: \n'
            let roleCount = 0;
            message.member.roles.map(function(item){
              if(item.name.indexOf('#') > -1){
                output += item.name.slice(1);
                output += '\n';
                roleCount++;
              }
            });
            if(roleCount == 0) output += `There are none, get started by typing ${config["bot-prefix"]}role add <Role-Name>`

            //Finalize the output and send it
            output += '```';
            message.channel.send(output);
            break;
          default:
            message.channel.send('I couldnt understand you :(\nPlease use add, remove or list');
            break;
        }
    }
};
config
