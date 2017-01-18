var color = require('./util/colors').color;

var quiet = true; //when -v is not given
var debug = false; 
var quietLog = true; //when --logs is not given
var filelogger = {};
var path = require('path');
var fs = require('fs');
var winston = require('winston');

if(quietLog){
	var debuglogpath;
	var errlogpath;
	var dirPath= global.basePath || process.cwd(); //root of repo

	var logDirPath = path.join(dirPath,"logs");
	if(isExist(logDirPath)){
		dirPath = logDirPath;
	}

	debuglogpath = path.join(dirPath,"debug.log");
	errlogpath = path.join(dirPath,"exceptions.log");

	//console.log("writing logs to: " + debuglogpath +", "+ errlogpath);

	filelogger = new (winston.Logger)({
	  transports: [
	    //new (winston.transports.Console)({ json: false, timestamp: true }),
	    new winston.transports.File({ filename: debuglogpath , json: false });
	  ],
	  exceptionHandlers: [
	    //new (winston.transports.Console)({ json: false, timestamp: true }),
	    new winston.transports.File({ filename: errlogpath, json: false });
	  ],
	  exitOnError: false
	});
}

exports.info = function(msg,colorCode){
	exports.detailInfo(msg);
	logToConsole(msg,colorCode);
}

exports.detailInfo = function(msg){
	quietLog || filelogger.info(msg);
}

exports.debug = function(msg){
	debug && exports.warn(msg);
}

exports.warn = function(msg){
	logToConsole(msg,'yellow');
	quietLog || filelogger.warn(msg);
}

exports.error = function(msg){
	logToConsole(msg,'red');
	quietLog || filelogger.error(msg);
}

function logToConsole(msg,colorCode){
	if(!quiet){
		if(colorCode){
			msg = color(msg,colorCode.toLowerCase());
		}
		console.log(msg);
	}
}

exports.setVerbose= function(flag){
	quiet = !flag;
}

exports.debugLogs= function(flag){
	debug = flag;
}

exports.writeLogs= function(flag){
	quietLog = !flag;
}

function isExist(path){
	try{
		fs.accessSync(path, fs.F_OK);
		return true;
	}catch(e){
		return false;
	}
}

if(quietLog){
	process.on('uncaughtException', function (err) {
	  exports.error(err);
	  //process.exit(1); //want the server keep running
	});
}