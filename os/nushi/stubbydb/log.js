var color = require('./util/colors').color;

var quiet = true;
var quietLog = true;
var filelogger = {};

if(quietLog){
	var winston = require('winston');
	var path = require('path');
	var fs = require('fs');

	var debuglogpath;
	var errlogpath;
	var dirPath= GLOBAL.basePath || process.cwd();

	if(isExist(path.join(dirPath,"logs"))){
		debuglogpath = path.join(dirPath,"logs","debug.log");
		errlogpath = path.join(dirPath,"logs","exceptions.log");
	}else{
		debuglogpath = path.join(dirPath,"debug.log");
		errlogpath = path.join(dirPath,"exceptions.log");
	}

	console.log("writing logs to: " + debuglogpath +", "+ errlogpath);

	filelogger = new (winston.Logger)({
	  transports: [
	    //new (winston.transports.Console)({ json: false, timestamp: true }),
	    new winston.transports.File({ filename: debuglogpath , json: false })
	  ],
	  exceptionHandlers: [
	    //new (winston.transports.Console)({ json: false, timestamp: true }),
	    new winston.transports.File({ filename: errlogpath, json: false })
	  ],
	  exitOnError: false
	});
}

exports.info = function(msg,status){
	var coloredmsg;
	if(status && status.toLowerCase() == 'success'){
		coloredmsg = color(msg,'green');
	}else if(status && status.toLowerCase() == 'fail'){
		coloredmsg = color(msg,'red');
	}

	quiet || console.log(coloredmsg || msg);
	quietLog || filelogger.info(msg);
}

exports.detailInfo = function(msg){
	quietLog || filelogger.info(msg);
}

exports.warn = function(msg){
	quiet || console.warn(color(msg,'yellow'));
	quietLog || filelogger.warn(msg);
}

exports.error = function(msg){
	quiet || console.error(color(msg,'red'));
	quietLog || filelogger.error(msg);
}

exports.setVerbose= function(flag){
	quiet = !flag;
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

/*process.on('uncaughtException', function (err) {
  exports.error(err);
  //process.exit(1); //want the server keep running
});*/