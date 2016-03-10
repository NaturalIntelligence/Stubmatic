var winston = require('winston');
var util = require('./preutil');
var YAML = require('yamljs');

var logs = util.getConfigFor('logs');

var debuglogpath = "./debug.log"; //__dirname + debuglogpath
var errlogpath = "./exceptions.log";

if(logs){
	debuglogpath = logs.info;
	errlogpath = logs.error;
}
var logger = new (winston.Logger)({
  transports: [
    //new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: debuglogpath , json: false })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ json: false, timestamp: true }),
    new winston.transports.File({ filename: errlogpath, json: false })
  ],
  exitOnError: false
});

module.exports = logger;


