var logger = require('./log');
var fileutil = require('./util/fileutil');
var reqResolver = require('./request_resolver');
var path = require('path');

var lastFileIndex = [];

exports.readResponse = function (matchedentry){
	var responseCode;
	var res = matchedentry.response;

	var fileName ="";
	var matches = matchedentry.request.matches;
	if(res.file){
		return resolveName(res.file,matches);
	}else if(res.files){
		if(res.strategy == 'random'){
			var len = res.files.length
			var i = Math.floor((Math.random() * len) + 1) - 1;
			return resolveName(res.files[i],matches);
		}else if(res.strategy == 'round-robin'){
			var len = res.files.length;
			var mappedReqestIndex = matchedentry.index;
			if(lastFileIndex[mappedReqestIndex] != undefined){
				lastFileIndex[mappedReqestIndex] = lastFileIndex[mappedReqestIndex] == len - 1 ? 0 : lastFileIndex[mappedReqestIndex]+1;
			}else{
				lastFileIndex[mappedReqestIndex] = 0;
			}
			var index = lastFileIndex[mappedReqestIndex];
			return resolveName(res.files[index],matches);
		}else if(res.strategy == 'first-found'){
			for(var i=0;i<res.files.length;i++){
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

var stubsDir = require("./configbuilder").getConfig().stubs || "";

function resolveName(file,matches){
	var fileName = "";
	if(typeof file === 'object'){
		file.name = path.join(stubsDir,reqResolver.applyMatches(file.name,matches));
		responseCode = file.status;
	}else{
		file = path.join(stubsDir,reqResolver.applyMatches(file,matches));
	}

	return file;
}