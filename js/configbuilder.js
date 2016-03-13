var fs = require('fs');
var util = require('./preutil');

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
		port: 7777
	},
	logs:{
		path: 'logs'
	}
};

/*exports.reset = function(){
	var someconfig = {
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
			request: "response.yaml"
		},
		server: {
			port: 7777
		}
	};
	defaultConfig = someconfig;
}*/

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
			console.log("Invalid json");
			process.exit(1);
		}
		buildFromJsonConfig(jsonConfig);
	}else if(options['-d']){
		buildFromDirectory(options['-d']);
	}

	if(options['-p']){
		setConfig('server.port',options['-p']);
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
	console.log(process.cwd());
	if(util.isExist(process.cwd() + "/config.json")){
		var jsonconfig = require(process.cwd() +'/config.json');
		buildFromJsonConfig(jsonconfig);
	}else{
		buildFromDirectory(process.cwd());
	}
}

var merge = require('deepmerge');

function buildFromJsonConfig(jsonconfig){
	defaultConfig = merge(defaultConfig,jsonconfig);
}

/*
build configurtaion on the basis of directory structure
It'll ignore if there is any config file in specified directory.
It update the path of : mappings, dbsets, and stubs, whichever is presnt
*/
function buildFromDirectory(dirPath){
	if(util.isExist(dirPath+"/dbsets")){
		defaultConfig['dbsets'] = dirPath + '/dbsets/';
	}

	if(util.isExist(dirPath+"/stubs")){
		defaultConfig['stubs'] = dirPath + '/stubs/';
	}

	if(util.isExist(dirPath+"/logs")){
		defaultConfig['logs']['path'] = dirPath + '/logs/';
	}else{
		defaultConfig['logs']['path'] = dirPath + '/';
	}

	if(util.isExist(dirPath+"/dumps")){
		defaultConfig['dumps'] = dirPath + '/dumps/';
	}

	var files = util.ls(dirPath+"/mappings");
	if(files.length > 0){
		defaultConfig['mappings']['requests'] = [];
		files.forEach(function(filename){
			defaultConfig['mappings']['requests'].push(dirPath + '/mappings/' + filename);
		});
	}
}

exports.getConfig= function(){
	return defaultConfig;
}


