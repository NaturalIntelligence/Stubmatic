var logger = require('./log');
var fileutil = require('./util/fileutil');
var util = require('./util/util');
var path = require('path');
var configBuilder = require("./configbuilder");

var lastFileIndex = [];

exports.readResponse = function (matchedentry){
	var responseCode;
	var res = matchedentry.response;
	var matches = matchedentry.request.matches;
	if(res.file){
		return resolveName(res.file,matches);
	}else if(res.files){
		var len = res.files.length, i=0;
		if(res.strategy === 'random'){
			i = Math.floor((Math.random() * len) + 1) - 1;
			return resolveName(res.files[i],matches);
		}else if(res.strategy === 'round-robin'){
			var mappedReqestIndex = matchedentry.index;
			if(lastFileIndex[mappedReqestIndex] != undefined){
				lastFileIndex[mappedReqestIndex] = lastFileIndex[mappedReqestIndex] === len - 1 ? 0 : lastFileIndex[mappedReqestIndex]+1;
			}else{
				lastFileIndex[mappedReqestIndex] = 0;
			}
			i = lastFileIndex[mappedReqestIndex];
			return resolveName(res.files[i],matches);
		}else if(res.strategy === 'first-found'){
			for(i=0;i<len;i++){
				var fileName = "";
				res.files[i] = resolveName(res.files[i],matches);
				if(typeof res.files[i] === 'object'){
					fileName = res.files[i].name;
				}else{
					fileName = res.files[i];
				}

				if(fileutil.isExist(fileName)){
					return res.files[i];
				}
			}
		}
	}
}


var stubsDir = configBuilder.getConfig().stubs || "";

function resolveName(file,matches){
	if(typeof file === 'object'){
		file.name = path.join(stubsDir,util.applyMatches(file.name,matches));
		responseCode = file.status;
	}else{
		file = path.join(stubsDir,util.applyMatches(file,matches));
	}

	return file;
}