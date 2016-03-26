#!/usr/bin/env node

if(process.argv[2] == "--help" || process.argv[2] == "-h"){
	console.log();
	var fs = require('fs');
	console.log(fs.readFileSync(__dirname + "/help", 'utf-8'));
	console.log();
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
			require('./os/nushi/stubbydb/log').setVerbose(true);
		}

		if(key == '--port' || key == '-p'){
			key = '-p';
		}else if(key == '--config' || key == '-c'){
			key = '-c';
		}else if(key == '--mapping' || key == '-m'){
			key = '-m';
		}else if(key == '--stub' || key == '-s'){
			key = '-s';
		}else if(key == '-C' || key == '-d' || key == '-v' || key == '--host'){
			//key = '-p';
		}else{
			console.log("Invalid options");
			console.log("Try 'stubbydb --help' for more information.*/")
			process.exit(1);
		}
		options[key] = process.argv[++i];
	}
}



var configBuilder = require("./os/nushi/stubbydb/configbuilder");
configBuilder.buildConfig(options,process.argv.length);
var config = configBuilder.getConfig();
console.log("Configuration: " + JSON.stringify(config));


var stubbyDB = require('./os/nushi/stubbydb/stubbyDB');
var server = new stubbyDB();