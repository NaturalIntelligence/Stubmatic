var logger = require('./log');
var preutil = require('./preutil');
var util = require('./util');
var fs = require('fs');

var requestContext = [];

var dirPath = require("./configbuilder").getConfig().stubs || "";

exports.readResponse = function (res,req_context,callback){
	var index = req_context.matchedConfigIndex;

	if(res.body){
		callback(res.body);
	}else if(res.file){
		var fileName = dirPath+buildFileName(res.file,req_context);
		util.readFromFile(fileName,callback);
	}else if(res.files){
		if(res.strategy == 'random'){
			var len = res.files.length
			var i = Math.floor((Math.random() * len) + 1) - 1;
			return util.readFromFile(dirPath+buildFileName(res.files[i],req_context),callback);
		}else if(res.strategy == 'round-robin'){
			var len = res.files.length;
			if(requestContext[index] != undefined){
				requestContext[index] = requestContext[index] == len - 1 ? 0 : requestContext[index]+1;
			}else{
				requestContext[index] = 0;
			}
			return util.readFromFile(dirPath+buildFileName(res.files[requestContext[index]],req_context),callback);
		}else if(res.strategy == 'first-found'){
			for(var i=0;i<res.files.length;i++){
				var fileName = res.files[i];
				fileName = dirPath+buildFileName(fileName,req_context);
				try {
				    fs.accessSync(fileName, fs.F_OK);
				    return util.readFromFile(fileName,callback);
				} catch(e) {
				    logger.error(e);
				}
			}
		}
	}else {
		callback("");
	}
}

function buildFileName(fileName_regx,req_context){
	if(req_context.parts){
		return util.replaceParts(fileName_regx,req_context.parts);
	}
	return fileName_regx;
}