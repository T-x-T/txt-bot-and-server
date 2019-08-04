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
const discord = require('discord.js');
const config = require('./../../config.js');

module.exports = {
    name: 'admin',
    description: 'Commands only for admins',
    aliases: [''],

    execute(message, args) {
        //Check if the author is admin
        if (message.member.roles.has(config["admin-role"])) {
            //Check the first argument and execute it
            switch (args[0]) {
                case 'log':

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
                            message.channel.bulkDelete(amount, true)
                                .catch(err => {
                                    log.write(2, 'Admin Command: Bulk delete failed', { message: message, error: err }, function (err) { });
                                    message.channel.send('Welp, that didnt work :(');
                                });
                        } else {
                            for (var i = 0; i < amount; i += 50) {
                                if (amount >= 50) {
                                    message.channel.bulkDelete(50, true)
                                        .catch(err => {
                                            log.write(2, 'Admin Command: Mass bulk delete failed', { message: message, error: err }, function (err) { });
                                            message.channel.send('Welp, that didnt work :(');
                                        });
                                } else {
                                    message.channel.bulkDelete(amount, true)
                                        .catch(err => {
                                            log.write(2, 'Admin Command: Mass bulk delete failed', { message: message, error: err }, function (err) { });
                                            message.channel.send('Welp, that didnt work :(');
                                        });
                                }
                            }
                        }
                    }
                    break;
                case 'performance':
                    //get all data
                    perfLog.getPerfLogs(false, function (data) {
                        //Set all graphs we want to gather
                        var graphTypes = [
                            'memNodeAvg',
                            'memNodeMax',
                            'memFreeAvg',
                            'memFreeMin',
                            'memUsageAvg',
                            'memUsageMax',
                            'load'
                        ];
                        //Loop over graphTypes
                        for (var i = 0; i < graphTypes.length; i++) {
                            //Get required data
                            let tempData = [];
                            data.forEach((entry) => {
                                switch (graphTypes[i]) {
                                    case 'memNodeAvg':
                                        tempData.push(entry.memNodeAvg);
                                        break;
                                    case 'memNodeMax':
                                        tempData.push(entry.memNodeMax);
                                        break;
                                    case 'memFreeAvg':
                                        tempData.push(entry.memFreeAvg);
                                        break;
                                    case 'memFreeMin':
                                        tempData.push(entry.memFreeMin);
                                        break;
                                    case 'memUsageAvg':
                                        tempData.push(entry.memUsageAvg);
                                        break;
                                    case 'memUsageMax':
                                        tempData.push(entry.memUsageMax);
                                        break;
                                    case 'load':
                                        tempData.push(entry.load);
                                        break;
                                    default:
                                        console.log('Cant find graphType');
                                        break;
                                }
                            });
                            //Create the graphData Object
                            var graphData = {
                                res_x: 1920,
                                res_y: 1080,
                                legend_x: 'TIME',
                                scale: 100,
                                scale_res_x: 15,
                                scale_res_y: 10,
                                min_value_x: '-7d',
                                min_value_y: 0,
                                max_value_x: 'Now',
                                max_value_y: 100,
                                data: tempData
                            };
                            switch (graphTypes[i]) {
                                case 'memNodeAvg':
                                    graphData.title = 'Node Memory AVG';
                                    graphData.legend_y = 'USED MEMORY';
                                    graphData.max_value_y = Math.max(...tempData);
                                    graphData.scale = Math.max(...tempData);
                                    graphData.unit_y = 'MB';
                                    break;
                                case 'memNodeMax':
                                    graphData.title = 'Node Memory MAX';
                                    graphData.legend_y = 'USED MEMORY';
                                    graphData.max_value_y = Math.max(...tempData);
                                    graphData.scale = Math.max(...tempData);
                                    graphData.unit_y = 'MB';
                                    break;
                                case 'memFreeAvg':
                                    graphData.title = 'System free Memory AVG';
                                    graphData.legend_y = 'FREE MEMORY';
                                    graphData.max_value_y = Math.max(...tempData);
                                    graphData.scale = Math.max(...tempData);
                                    graphData.unit_y = 'MB';
                                    break;
                                case 'memFreeMin':
                                    graphData.title = 'System free Memory MIN';
                                    graphData.legend_y = 'FREE MEMORY';
                                    graphData.max_value_y = Math.max(...tempData);
                                    graphData.scale = Math.max(...tempData);
                                    graphData.unit_y = 'MB';
                                    break;
                                case 'memUsageAvg':
                                    graphData.title = 'System Memory usage AVG';
                                    graphData.legend_y = 'USED MEMORY';
                                    graphData.max_value_y = 100;
                                    graphData.unit_y = '%';
                                    break;
                                case 'memUsageMax':
                                    graphData.title = 'System Memory usage MAX';
                                    graphData.legend_y = 'USED MEMORY';
                                    graphData.max_value_y = 100;
                                    graphData.unit_y = '%';
                                    break;
                                case 'load':
                                    graphData.title = 'System load';
                                    graphData.legend_y = 'LOAD';
                                    graphData.max_value_y = 10;
                                    graphData.unit_y = '';
                                    break;
                                default:
                                    console.log('Cant find graphType');
                                    break;
                            }
                            //Hand all the data to the graph file
                            graph.create(graphData, function (file) {
                                if (file) {
                                    //We got some valid data, so lets send it
                                    message.channel.send({ files: [{ attachment: new discord.Attachment(file).attachment }] })
                                        .catch(console.log);
                                } else {
                                    //Some error occured
                                    log.write(2, 'Admin performance command didnt receive a proper file', {}, function (err) { });
                                }
                            });
                        }
                    });
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