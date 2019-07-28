/*
 *	COMMAND FILE FOR ADMIN COMMANDS
 *	Command for all the admin thingys
 */
const graph = require('./../../lib/graph.js');
const fs = require('fs');
const log = require('./../../lib/log.js');
const path = require('path');

module.exports = {
    name: 'admin',
    description: 'Commands only for admins',
    aliases: [''],

    execute(message, args) {
        //Performance graphs?
        if (args[0] == 'performance') {
            //Hand all the data to the graph file
            graph.create(1920, 1080, 'Test-Title', 'TIME', 'FREE MEMORY', 1000, 500, 100, 100, [100, 200, 300, 400, 500, 600, 500, 400, 300, 200, 100, 0, 50, 1000, 1100], function (fileName) {
                var filePath = 'temp/' + fileName;
                //Send the image
                message.channel.send({
                    files: [{
                        attachment: filePath,
                        name: fileName
                    }]
                })
                    .catch(log.write(3, 'Cant send performance graph image', { filename: fileName }, function (err) { }));
            });
            return;
        }

        //Paramater not found
        message.channel.send('Sorry, I cant find that paramater');
    }
};