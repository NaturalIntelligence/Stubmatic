#!/usr/bin/env node

if(process.argv[2] == "--help" || process.argv[2] == "-h"){
	console.log();
	var fs = require('fs');
	console.log(fs.readFileSync(__dirname + "/man/stubmatic.1", 'utf-8'));
    process.exit(1);
}

if(process.argv[2] == "--version"){
	var fs = require('fs');
	console.log(require(__dirname + "/package.json").version);
    process.exit(1);
}

if(process.argv[2] == "init"){
	require('./init').init(process.argv[3] || "stub-repo");
    process.exit(1);
}

var path = require('path');
var fs = require('fs');

var isExist = function(path){
	try{
		fs.accessSync(path, fs.F_OK);
		return true;
	}catch(e){
		//logger.error(e);
		return false;
	}
}

var options = {}
for(var i=2; i<process.argv.length;i++){
	if(process.argv[i].indexOf("-") === 0){
		var key = process.argv[i];
		if(key == '-d' ){
			if(isExist(process.argv[i+1])){
				global.basePath = process.argv[i+1];
			}else{
				global.basePath = path.join(process.cwd(),process.argv[i+1]);
			}
		}else if(key == '-v' || key == '--verbose'){
			require('./os/nushi/stubmatic/log').setVerbose(true);
			continue;
		}else if(key == '-l' || key == '--logs'){
			require('./os/nushi/stubmatic/log').writeLogs(true);
			continue;
		}else if(key == '--debug'){
			require('./os/nushi/stubmatic/log').debugLogs(true);
			continue;
		}


		if(key == '--port' || key == '-p'){
			key = '-p';
		}else if(key == '--config' || key == '-c'){
			key = '-c';
		}else if(key == '--mapping' || key == '-m'){
			key = '-m';
		}else if(key == '--stub' || key == '-s'){
			key = '-s';
		}else if(key == '-d' || key == '-v' || key == '--host'
			|| key == '-l' || key == '-P' || key == '--mutualSSL'){
			//valid keys
		}else{
			console.log("Invalid options");
			console.log("Try 'stubmatic --help' for more information.*/")
			process.exit(1);
		}
		options[key] = process.argv[++i];
	}
}


var configBuilder = require("./os/nushi/stubmatic/configbuilder");
configBuilder.buildConfig(options,process.argv.length);
var config = configBuilder.getConfig();
console.log("Configuration: " + JSON.stringify(config));


var stubmatic = require('./os/nushi/stubmatic/stubmatic');
var server = new stubmatic();