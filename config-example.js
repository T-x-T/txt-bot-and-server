/*
 *  EXAMPLE CONFIG FILE
 *  Copy this file and rename to config.js, then customize all options
 */


//Create the container
var conf = {
    'http-port': 3000,
    'https-port': 3001,
    'bot-prefix': '+',
    'bot-token': 'ENTER YOUR TOKEN HERE',
    'mongodb-url': 'mongodb://HOSTNAME/DATABASE'
};

//Export the container
module.exports = conf;