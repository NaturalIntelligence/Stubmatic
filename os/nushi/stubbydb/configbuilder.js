var fs = require('fs');
var fileutil = require('./util/fileutil');
var path = require('path');
var logger = require('./log');

var defaultConfig = {
	mappings: {
		default: {
			request:{
				method: 'GET'
			},
			response: {
				strategy: 'first-found',
				latency: 0,
				status: 200
			}
		},
		requests: ["response.yaml"]
	},
	server: {
		port: 7777,
		host: 'localhost'
	}
};

var setConfig = function(path, value) {
	var s = defaultConfig;
    var pList = path.split('.');
    var len = pList.length;
    for(var i = 0; i < len-1; i++) {
        var elem = pList[i];
        if( !s[elem] ) s[elem] = {}
        s = s[elem];
    }

    s[pList[len-1]] = value;
}

exports.buildConfig = function(options,count){

	if(count == 2){//No option is provided. Run with default options
		useDefaultConfig();
	}else if(options['-c']){
		var jsonconfig = require(options['-c']);
		buildFromJsonConfig(jsonconfig);
	}else if(options['-C']){
		var jsonConfig;
		try{
			jsonConfig = JSON.parse(options['-C']);
		}catch(e){
			logger.error("Invalid json");
			process.exit(1);
		}
		buildFromJsonConfig(jsonConfig);
	}else if(options['-d']){
		buildFromDirectory(options['-d']);
	}

	if(options['-p']){
		setConfig('server.port',options['-p']);
	}

	if(options['--host']){
		setConfig('server.host',options['--host']);
	}

	if(options['-m']){
		defaultConfig.mappings.requests = [];
		defaultConfig.mappings.requests.push(options['-m']);
	}

	if(options['-s']){
		setConfig('stubs',options['-s']);
	}

}

/* 
load config from config.json, if presents. 
Otherwise follow current directory structure.
Use default port only.
*/
function useDefaultConfig(){
	logger.info(process.cwd());
	if(fileutil.isExist(path.join(process.cwd() , "/config.json"))){
		var jsonconfig = require(path.join(process.cwd() ,'/config.json'));
		buildFromJsonConfig(jsonconfig);
	}else{
		logger.warn("config.json is not found. Checking for directory structure");
		buildFromDirectory(process.cwd());
	}
}

var merge = require('deepmerge');

function buildFromJsonConfig(jsonconfig){
	delete defaultConfig.mappings.requests;
	defaultConfig = merge(defaultConfig,jsonconfig);
}

/*
build configurtaion on the basis of directory structure
It'll ignore if there is any config file in specified directory.
It update the path of : mappings, dbsets, and stubs, whichever is presnt
*/
function buildFromDirectory(dirPath){
	dirPath = fixDirPath(dirPath);
	if(fileutil.isExist(dirPath+"dbsets")){
		defaultConfig['dbsets'] = dirPath + 'dbsets/';
	}

	if(fileutil.isExist(dirPath+"stubs")){
		defaultConfig['stubs'] = dirPath + 'stubs/';
	}

	if(fileutil.isExist(dirPath+"dumps")){
		defaultConfig['dumps'] = dirPath + 'dumps/';
	}

	var files = fileutil.ls(dirPath+"mappings");
	if(files.length > 0){
		defaultConfig['mappings']['requests'] = [];
		files.forEach(function(filename){
			defaultConfig['mappings']['requests'].push(path.join(dirPath , 'mappings' , filename));
		});
	}
}

exports.getConfig= function(){
	return defaultConfig;
}

function fixDirPath(dirpath){
	var lastChar = dirpath.charAt(dirpath.length - 1); 
	if(lastChar != '/'){
		return dirpath + '/';
	}
	return dirpath;
}


