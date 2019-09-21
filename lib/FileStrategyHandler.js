/// @ts-check
var logger = require('./log');
var fileutil = require('./util/fileutil');
var util = require('./util/util');
var path = require('path');
var roundRobinIndex = [];
const resolveParsedRequestExpression = require('./expressions/parsedRequestExpression')

module.exports = class FileStrategyHandler{
	constructor(stubsLocation){
		this.stubsLocation = stubsLocation;
	}

	getFileName (matchedentry) {
		var res = matchedentry.response,
			matches = matchedentry.request.matches;
	
		if (res.file) {
			return this.resolveName(res.file, matches);
		} else{
			var len = res.files.length;
			if (res.strategy === 'random') {
				return this.resolveName(res.files[getRandomIndex(len)], matches);
			} else if (res.strategy === 'round-robin') {
				var mi = matchedentry.index;
				roundRobinIndex[mi] = getRRIndex(roundRobinIndex[mi], len);
				return this.resolveName(res.files[roundRobinIndex[mi]], matches);
			} else if (res.strategy === 'first-found') {
				for (var i = 0; i < len; i++) {
					var fileObj = this.resolveName(res.files[i], matches);
					if (checkIfExist(fileObj)) return fileObj;
				}
			} else if (Array.isArray(res.strategy)) {
				if (res.strategy.indexOf("first-found") > -1) {
					if (res.strategy.indexOf("random") > -1) {
						return this.getRandomFirstFound(res, matches);
					} else if (res.strategy.indexOf("round-robin") > -1) {
						return this.getRoundRobinFirstFound(res,matches,matchedentry.index);
					}
				}
			}
			logger.error(res.strategy + " is not supported");
		}
	};

	resolveName(fileEntry, matches) {
		var stubsPath = this.stubsLocation || global.basePath;
		if (typeof fileEntry === 'object') {
			fileEntry.name = path.join(stubsPath, resolveParsedRequestExpression(fileEntry.name, matches));
		} else {
			fileEntry = path.join(stubsPath, resolveParsedRequestExpression(fileEntry, matches));
		}
		return fileEntry;
	}

	

	getRandomFirstFound(res, matches) {
		var len = res.files.length;
		for (var i = 0; i < len; i++) {
			var ri = getRandomIndex(len);
			var fileObj = this.resolveName(res.files[ri], matches);
			if (checkIfExist(fileObj))	return fileObj;
		}
	}

	getRoundRobinFirstFound(res,matches,mi) {
		var len = res.files.length;
		var rri = getRRIndex(roundRobinIndex[mi], len);
		var limit = len + (roundRobinIndex[mi] || 0);
		for (let i = rri; i < limit; i++) {
			var fileObj = this.resolveName(res.files[rri], matches);
			if (checkIfExist(fileObj)) {
				roundRobinIndex[mi] = rri;
				return fileObj;
			} else if (rri !== len - 1)
				rri++;
			else
				rri = 0;
		}
	}

}

function replaceRequestParamExp(fileName, matches){
	const regx = "([a-zA-Z]+)\\[\\s([0-9]+)\\s*\\]";
	const reqParamsPart = util.getMatches(fileName,regx);
	const paramName = reqParamsPart[1];
	const index =  reqParamsPart[2];
	return matches[paramName][index];
}

function getRandomIndex(max) {
	return Math.floor((Math.random() * max) + 1) - 1;
}

function getRRIndex(rri, len) {
	if (rri !== undefined) {
		rri = rri === len - 1 ? 0 : rri + 1;
	} else {
		rri = 0;
	}
	return rri;
}



function checkIfExist(fileObj) {
	var fileName;
	if (typeof fileObj === 'object') {
		fileName = fileObj.name;
	} else {
		fileName = fileObj;
	}
	if (fileutil.isExist(fileName)) {
		return true;
	}
	return false;
}