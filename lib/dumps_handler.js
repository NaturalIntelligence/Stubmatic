var fs = require('fs');
var util = require('./util/util');
var path = require('path');

exports.handle = function(data){
	//var regx = "\\[\\[([^\\]]+)\\]\\]";
	var regx = "{{\\s*include\\(([^}]*)\\)\\s*}}";
	var matches = util.getAllMatches(data,regx);
	var dumpsdir = require("./configbuilder").getConfig().dumps;
	
	for(var i in matches){
		var match= matches[i];
		if(match[1].trim() === ''){
			//skip the error
		}else{
			var files = eval(match[1]);
			if(files && !Array.isArray(files) )		files = [files];

			var contentToreplace = "";
			for (var index in files) {
				var filePath= path.join(dumpsdir , files[index]);
				var readFileFlag = false;
				try{
					contentToreplace += fs.readFileSync(filePath, {encoding: 'utf-8'});
				}catch(err){
					//skip the error
				}
			}
			data = data.replace(match[0],contentToreplace);
		}
		
	}
	return data;
}
