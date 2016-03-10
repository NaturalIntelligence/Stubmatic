var YAML = require('yamljs');

var config;

try{
	config = YAML.parseFile("./config.yaml");
}catch(e){
	console.log("Config file is not found on root location of the project.");
}

exports.getConfigFor = function(name){
	for(var i in config){
	    if(config[i][name]){
	        return config[i][name];
	    }
	}
}