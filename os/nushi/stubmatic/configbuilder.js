var fs = require('fs');
var fileutil = require('./util/fileutil');
var path = require('path');
var logger = require('./log');

var config;

/**
use current directory if -d is not given
use config.json if -c is not given
use directory structure if config.json is missing and -c is not given
**/
exports.build = function(options){
	config = {
		mappings: {},
		server:{}
	};
	var repoPath = options['-d'] || ".";
	var configFile = path.join(repoPath,options['-c'] || "config.json");

	if(fileutil.isExist(configFile)){
		config = JSON.parse(fs.readFileSync(configFile,{encoding: 'utf-8'}));
		updateBasePath(repoPath);//TODO: check if some better options
	}else{
		logger.warn("Not able to read "+ configFile+".Building configuration from directory structure");
		buildFromDirectory(repoPath);
	}
	
	if(!config.server){
		config.server = {}
	}
	config.server.port = options['-p'] || config.server.port || 7777;
	config.server.host = options['--host'] || config.server.host || '0.0.0.0';
	if(options['-P']) config.server.securePort = options['-P'];
	if(options['--mutualSSL'])config.server.mutualSSL = options['--mutualSSL'];

}


/**
transforms all the path given in cofiguration file to absolute path
**/
function updateBasePath(basePath){

	['dbsets','stubs','dumps'].forEach(prop => {
		if(config[prop]){
			config[prop] = path.join(basePath , config[prop]);
		}
	});

	var files = config['mappings']['files'];
	var newMappings = [];
	files.forEach(function(filename){
		newMappings.push(path.join(basePath , filename));
	});

	config['mappings']['files'] = newMappings;

	if(config.server){
		if(config.server.key){
			config.server.key = path.join(basePath , config.server.key);
		}

		if(config.server.cert){
			config.server.cert = path.join(basePath , config.server.cert);
		}

		if(config.server.ca){
			var newcerfiles = [];
			config.server.ca.forEach(function(cert){
				newcerfiles.push(path.join(basePath , cert));
			});
		}

		config.server.ca = newcerfiles;
	}
}
/*
build configurtaion on the basis of directory structure
It'll ignore if there is any config file in specified directory.
It update the path of : mappings, dbsets, and stubs, whichever is present
*/
function buildFromDirectory(dirPath){
	["dbsets","stubs","dumps"].forEach( dirName => {
		var dbsetPath = path.join(dirPath,dirName);
		if(fileutil.isExist(dbsetPath)){
			config[dirName] = dbsetPath;
		}
	});

	var mappingsPath = path.join(dirPath,"mappings");
	var files = fileutil.ls(mappingsPath);
	if(files.length > 0){
		config['mappings']['files'] = [];
		files.forEach(function(filename){
			config['mappings']['files'].push(path.join(mappingsPath , filename));
		});
	}

	var trustStorePath = path.join(dirPath,"truststore");
	if(fileutil.isExist(trustStorePath)){
		config.server.key = path.join(trustStorePath , "server.key");
		config.server.cert = path.join(trustStorePath , "server.crt");

		var cacertPath = path.join(trustStorePath,"ca");
		var cacerts = fileutil.ls(cacertPath);

		if(cacerts.length > 0){
			config.server.ca = [];
			cacerts.forEach(function(filename){
				config.server.ca.push(path.join(cacertPath , filename));
			});
		}
	}

}

exports.getConfig= function(){
	return config;
}


