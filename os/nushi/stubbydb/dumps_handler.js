var fileutil = require('./util/fileutil');
var util = require('./util/util');
var path = require('path');
var deasync = require('deasync');

exports.handle = function(data){
	var regx = "\\[\\[([^\\]]+)\\]\\]";
	var matches = util.getAllMatches(data,regx);
	var dumpsdir = require("./configbuilder").getConfig().dumps;
	
	for(var i in matches){
		var match= matches[i];
		var dir= match[1].split(":")[0];
		var fileList= match[1].split(":")[1];
		var files= fileList.split(',');

		var contentToreplace = "";
		for (var index in files) {
			var filePath= path.join(dumpsdir , dir , files[index]);
			var readFileFlag = false;
			fileutil.readFromFile(filePath,function(filecontent){
				contentToreplace += filecontent;
				readFileFlag = true;
			});
			deasync.loopWhile(function(){return !readFileFlag;});
		}
		data = data.replace(match[0],contentToreplace);
	}
	return data;
}