var logger = require('./log');
var fileutil = require('./util/fileutil');
var reqResolver = require('./request_resolver');
var path = require('path');

var lastFileIndex = [];

var stubsDir = require("./configbuilder").getConfig().stubs || "";

exports.readResponse = function (matchedentry,callback){
	var res = matchedentry.response;
	if(res.body){
		callback(res.body);
	}else{
		var fileName ="";
		var matches = matchedentry.request.matches;
		if(res.file){
			fileName = res.file;
		}else if(res.files){
			if(res.strategy == 'random'){
				var len = res.files.length
				var i = Math.floor((Math.random() * len) + 1) - 1;
				fileName = res.files[i];
			}else if(res.strategy == 'round-robin'){
				var len = res.files.length;
				var mappedReqestIndex = matchedentry.index;
				if(lastFileIndex[mappedReqestIndex] != undefined){
					lastFileIndex[mappedReqestIndex] = lastFileIndex[mappedReqestIndex] == len - 1 ? 0 : lastFileIndex[mappedReqestIndex]+1;
				}else{
					lastFileIndex[mappedReqestIndex] = 0;
				}
				fileName = res.files[lastFileIndex[mappedReqestIndex]];
			}else if(res.strategy == 'first-found'){
				for(var i=0;i<res.files.length;i++){
					var fileName = res.files[i];
					fileName = path.join(stubsDir,reqResolver.applyMatches(fileName,matches));
					if(fileutil.isExist(fileName)){
						logger.info('Reading from file: ' + fileName);
						return fileutil.readFromFile(fileName,callback);
					}
				}
				logger.error('No matching file found.');
				return callback("");
			}
		}else{
			return callback("");
		}

		fileName = path.join(stubsDir,reqResolver.applyMatches(fileName,matches));
		logger.info('Reading from file: ' + fileName);
		return fileutil.readFromFile(fileName,callback);
	}
}