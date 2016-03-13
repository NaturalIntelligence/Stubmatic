var winston = require('winston');
var config = require("./configbuilder").getConfig();

var logs = config.logs.path || "";

var debuglogpath = logs + "/debug.log"; //__dirname + debuglogpath
var errlogpath = logs + "/exceptions.log";

console.log("writing logs to: " + debuglogpath +", "+ errlogpath);

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


