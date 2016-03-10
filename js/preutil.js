var YAML = require('yamljs');
var config = YAML.parseFile("./config.yaml");

exports.getConfigFor = function(name){
	for(var i in config){
	    if(config[i][name]){
	        return config[i][name];
	    }
	}
}