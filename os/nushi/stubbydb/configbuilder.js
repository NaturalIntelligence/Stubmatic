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
	if(options['-c'] && !options['-d']){
		if(!fileutil.isExist(options['-c'])){
			logger.info(options['-c'] + " doesn't exist");
		}
		var jsonconfig = JSON.parse(fs.readFileSync(options['-c'],{encoding: 'utf-8'}));
		buildFromJsonConfig(jsonconfig);
	}else if(options['-d']){
		if(options['-c']){
			var configpath = path.join(options['-d'],options['-c']);
			var jsonconfig = JSON.parse(fs.readFileSync(configpath,{encoding: 'utf-8'}));

			buildFromJsonConfig(jsonconfig);
			updateBasePath(options['-d']);
		}else{
			buildFromDirectory(options['-d']);
		}
	}else{
		useDefaultConfig();
	}

	if(options['-p']){
		setConfig('server.port',options['-p']);
	}

	if(options['-P']){
		setConfig('server.securePort',options['-P']);
	}

	if(options['--mutualSSL']){
		setConfig('server.mutualSSL',options['--mutualSSL']);
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

function updateBasePath(basePath){
	if(defaultConfig['dbsets']){
		defaultConfig['dbsets'] = path.join(basePath , defaultConfig['dbsets']);
	}

	if(defaultConfig['stubs']){
		defaultConfig['stubs'] = path.join(basePath , defaultConfig['stubs']);
	}

	if(defaultConfig['dumps']){
		defaultConfig['dumps'] = path.join(basePath , defaultConfig['dumps']);
	}

	var files = defaultConfig['mappings']['requests'];
	var newMappings = [];
	files.forEach(function(filename){
		newMappings.push(path.join(basePath , filename));
	});

	defaultConfig['mappings']['requests'] = newMappings;

	if(defaultConfig.server.key){
		defaultConfig.server.key = path.join(basePath , defaultConfig.server.key);
	}

	if(defaultConfig.server.cert){
		defaultConfig.server.cert = path.join(basePath , defaultConfig.server.cert);
	}

	if(defaultConfig.server.ca){
		var newcerfiles = [];
		defaultConfig.server.ca.forEach(function(cert){
			newcerfiles.push(path.join(basePath , cert));
		});
	}

	defaultConfig.server.ca = newcerfiles;
}
/*
build configurtaion on the basis of directory structure
It'll ignore if there is any config file in specified directory.
It update the path of : mappings, dbsets, and stubs, whichever is present
*/
function buildFromDirectory(dirPath){
	var dbsetPath = path.join(dirPath,"dbsets");
	if(fileutil.isExist(dbsetPath)){
		defaultConfig['dbsets'] = dbsetPath;
	}

	var stubsPath = path.join(dirPath,"stubs");
	if(fileutil.isExist(stubsPath)){
		defaultConfig['stubs'] = stubsPath;
	}

	var dumpsPath = path.join(dirPath,"dumps");
	if(fileutil.isExist(dumpsPath)){
		defaultConfig['dumps'] = dumpsPath;
	}

	var mappingsPath = path.join(dirPath,"mappings");
	var files = fileutil.ls(mappingsPath);
	if(files.length > 0){
		defaultConfig['mappings']['requests'] = [];
		files.forEach(function(filename){
			defaultConfig['mappings']['requests'].push(path.join(mappingsPath , filename));
		});
	}

	var trustStorePath = path.join(dirPath,"truststore");
	if(fileutil.isExist(trustStorePath)){
		defaultConfig.server.key = path.join(trustStorePath , "server.key");
		defaultConfig.server.cert = path.join(trustStorePath , "server.crt");

		var cacertPath = path.join(trustStorePath,"ca");
		var cacerts = fileutil.ls(cacertPath);

		if(cacerts.length > 0){
			defaultConfig.server.ca = [];
			cacerts.forEach(function(filename){
				defaultConfig.server.ca.push(path.join(cacertPath , filename));
			});
		}
	}
}

exports.getConfig= function(){
	return defaultConfig;
}


