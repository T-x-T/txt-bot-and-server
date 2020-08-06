/*
 *  UNIT TESTS
 *  Testing library using mocha
 */

//Configure config
ENVIRONMENT = 'testing';
console.log(ENVIRONMENT)
require('../config.js')();

//Setup the global emitter
const EventEmitter = require('events');
class Emitter extends EventEmitter {}
emitter = new Emitter();

//Dependencies
const log = require('../src/log'); //lgtm [js/unused-local-variable]

global.log(0, 'test', 'Mocha test started', false);

//This makes unhandledPromiseRejections fail tests
process.on('unhandledRejection', (reason, promise) => { 
  console.log(reason);
  throw promise 
});