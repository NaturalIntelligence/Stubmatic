var fs = require('fs');
var markers = require('./markers.js');
var deasync = require('deasync');
var dbsets = require('./dbset').dbsets;
var logger = require('./log');
var YAML = require('yamljs');

exports.getMatches = function(string, regex_str) {
  var regex = new RegExp(regex_str,"g");
  var matches = regex.exec(string);
  if(matches){
	  return matches;	
  }
}

exports.getAllMatches = function(string, regex_str) {
  regex = new RegExp(regex_str,"g");
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
  	var allmatches = [];
  	for(var i in match){
  		var submatch = match[i];
  		allmatches.push(submatch);
  	}
    matches.push(allmatches);
  }
  return matches;
}

exports.readFromFile = function(fileName,callback){
	console.log(fileName);
	fs.readFile(fileName, {encoding: 'utf-8'}, function(err,data){
	    if (!err){
	    	logger.info("Reading from " + fileName);
	    	callback(data);
	    }else{
	        //logger.info(fileName + " not found on disk");
	        callback("",404);
	    }
	});
}

exports.replaceParts = function(data,parts){
	for(var key in parts){
		var part = parts[key];
		for(var i=0;i<part.length;i++){
			rgx = new RegExp("<% "+ key +"\."+ i +" %>","g");
			data = data.replace(rgx,part[i]);	
		}
	}
	return data;
}

exports.replaceMarkers = function(data){
	for(var marker in markers){
		data = markers[marker](data);
	}
	return data;
}

exports.replaceDumps = function(data){
	var regx = "\\[\\[([^\\]]+)\\]\\]";
	var matches = exports.getAllMatches(data,regx);
	
	for(var i in matches){
		var match= matches[i];
		var dir= match[1].split(":")[0];
		var fileList= match[1].split(":")[1];
		var files= fileList.split(',');

		var contentToreplace = "";
		for (var index in files) {
			var filePath= dir + "/" + files[index];
			var readFileFlag = false;
			exports.readFromFile(filePath,function(filecontent){
				contentToreplace += filecontent;
				readFileFlag = true;
			});
			deasync.loopWhile(function(){return !readFileFlag;});
		}
		data = data.replace(match[0],contentToreplace);
	}
	return data;
}

exports.replaceWithDataSetPlaceHolders = function(data, dbset, key){
	var regx = "##([^#]+)##";
	var matches = exports.getAllMatches(data,regx);

	for(var i in matches){
		var match= matches[i];
		data = data.replace(match[0],dbsets[dbset].get(key)[match[1]]);
	}
	return data;
}

exports.wait = function(ms){
	deasync.sleep(ms);
}

exports.escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

