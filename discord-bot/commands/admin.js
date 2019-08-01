/*
 *	COMMAND FILE FOR ADMIN COMMANDS
 *	Command for all the admin thingys
 */

//FIX: you need to send the command twice to get the up to date image

const graph = require('./../../lib/graph.js');
const fs = require('fs');
const log = require('./../../lib/log.js');
const path = require('path');
const perfLog = require('./../../lib/perfLog.js');

module.exports = {
    name: 'admin',
    description: 'Commands only for admins',
    aliases: [''],

    execute(message, args) {
        //Performance graphs?
        //get all data
        perfLog.getPerfLogs(false, function (data) {
            if (args[0] == 'performance') {
                //Get required data
                let tempData = [];
                data.forEach((entry) => {
                    tempData.push(entry.memUsageAvg);
                });
                //Hand all the data to the graph file
                graph.create({
                    res_x: 1920,
                    res_y: 1080,
                    title: 'Test-Title',
                    legend_x: 'TIME',
                    legend_y: 'FREE MEMORY',
                    scale: 100,
                    scale_res_x: 15,
                    scale_res_y: 10,
                    min_value_x: '-4d',
                    min_value_y: 0,
                    max_value_x: 'Now',
                    max_value_y: 100,
                    unit_y: '%',
                    data: tempData
                }, function (fileName) {
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
        });

        //Paramater not found
        message.channel.send('Sorry, I cant find that paramater');
    }
};