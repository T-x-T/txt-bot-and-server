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
                    //Check if the user wants multiple entries or more info about a spefic one by checking if args[1] is a log id
                    if (args[1].length > 10) {
                        //The user wants details on a specific entry
                        log.readById(args[1], function (data) {
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
                            log.read(false, timespan, function (data) {
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
                                log.read(level, timespan, function (data) {
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
                                    log.write(2, 'Admin Command: Bulk delete failed', { message: message, error: err }, function (error) { });
                                    message.channel.send('Welp, that didnt work :(');
                                });
                        } else {
                            for (var i = 0; i < amount; i += 50) {
                                if (amount >= 50) {
                                    message.channel.bulkDelete(50, false)
                                        .catch(err => {
                                            log.write(2, 'Admin Command: Mass bulk delete failed', { message: message, error: err }, function (error) { });
                                            message.channel.send('Welp, that didnt work :(');
                                        });
                                } else {
                                    message.channel.bulkDelete(amount, false)
                                        .catch(err => {
                                            log.write(2, 'Admin Command: Mass bulk delete failed', { message: message, error: err }, function (error) { });
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
