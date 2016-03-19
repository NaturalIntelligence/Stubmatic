var logger = require('./log');
var fileutil = require('./util/fileutil');
var util = require('./util/util');
var fs = require('fs');
var path = require('path');

var requestContext = [];

var dirPath = require("./configbuilder").getConfig().stubs || "";

exports.readResponse = function (matchedentry,callback){
	var res = matchedentry.response;
	var reqMatches = matchedentry.request.matches;

	var index = matchedentry.index;

	if(res.body){
		callback(res.body);
	}else if(res.file){
		var fileName = path.join(dirPath,buildFileName(res.file,reqMatches));
		fileutil.readFromFile(fileName,callback);
	}else if(res.files){
		if(res.strategy == 'random'){
			var len = res.files.length
			var i = Math.floor((Math.random() * len) + 1) - 1;
			return fileutil.readFromFile(path.join(dirPath,buildFileName(res.files[i],reqMatches)),callback);
		}else if(res.strategy == 'round-robin'){
			var len = res.files.length;
			if(requestContext[index] != undefined){
				requestContext[index] = requestContext[index] == len - 1 ? 0 : requestContext[index]+1;
			}else{
				requestContext[index] = 0;
			}
			return fileutil.readFromFile(path.join(dirPath,buildFileName(res.files[requestContext[index]],reqMatches)),callback);
		}else if(res.strategy == 'first-found'){
			for(var i=0;i<res.files.length;i++){
				var fileName = res.files[i];
				fileName = path.join(dirPath,buildFileName(fileName,reqMatches));
				try {
				    fs.accessSync(fileName, fs.F_OK);
				    return fileutil.readFromFile(fileName,callback);
				} catch(e) {
				    logger.error(e);
				}
			}
		}
	}else {
		callback("");
	}
}

function buildFileName(fileName_regx,reqMatches){
	if(reqMatches){
		return util.replaceParts(fileName_regx,reqMatches);
	}
	return fileName_regx;
}