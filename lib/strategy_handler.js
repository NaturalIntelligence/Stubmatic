var logger = require('./log');
var fileutil = require('./util/fileutil');
var util = require('./util/util');
var path = require('path');
var configBuilder = require("./configbuilder");
var roundRobinIndex = [];

exports.getFileName = function (matchedentry) {
	var res = matchedentry.response,
		matches = matchedentry.request.matches;

	if (res.file) {
		return resolveName(res.file, matches);
	} else if (res.files) {
		var len = res.files.length;
		if (res.strategy === 'random') {
			return resolveName(res.files[getRandomIndex(len)], matches);
		} else if (res.strategy === 'round-robin') {
			var mi = matchedentry.index;
			roundRobinIndex[mi] = getRRIndex(roundRobinIndex[mi], len);
			return resolveName(res.files[roundRobinIndex[mi]], matches);
		} else if (res.strategy === 'first-found') {
			for (var i = 0; i < len; i++) {
				var fileObj = resolveName(res.files[i], matches);
				if (checkIfExist(fileObj)) return fileObj;
			}
		} else if (Array.isArray(res.strategy)) {
			if (res.strategy.indexOf("first-found")) {
				if (res.strategy.indexOf("random") > -1) {
					return getRandomFirstFound(res, matches);
				} else if (res.strategy.indexOf("round-robin") > -1) {
					return getRoundRobinFirstFound(res,matches,matchedentry.index);
				}
			}
		}
	}
};

function getRandomFirstFound(res, matches) {
	var len = res.files.length;
	for (var i = 0; i < len; i++) {
		var ri = getRandomIndex(len);
		var fileObj = resolveName(res.files[ri], matches);
		if (checkIfExist(fileObj))	return fileObj;
	}
}

function getRoundRobinFirstFound(res,matches,mi) {
	var len = res.files.length;
	var rri = getRRIndex(roundRobinIndex[mi], len);
	var limit = len + (roundRobinIndex[mi] || 0);
	for (i = rri; i < limit; i++) {
		var fileObj = resolveName(res.files[rri], matches);
		if (checkIfExist(fileObj)) {
			roundRobinIndex[mi] = rri;
			return fileObj;
		} else if (rri !== len - 1)
			rri++;
		else
			rri = 0;
	}
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

function resolveName(file, matches) {
	var stubsPath = configBuilder.getConfig().stubs || global.basePath;
	if (typeof file === 'object') {
		file.name = path.join(stubsPath, util.applyMatches(file.name, matches));
	} else {
		file = path.join(stubsPath, util.applyMatches(file, matches));
	}
	return file;
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