#!/usr/bin/env node

if(process.argv[2] == "--help" || process.argv[2] == "-h"){
	console.log();
	var fs = require('fs');
	console.log(fs.readFileSync("help", 'utf-8'));
	console.log();
    process.exit(1);
}

var options = {}
for(var i=2; i<process.argv.length;i++){
	if(process.argv[i].startsWith("-")){
		var key = process.argv[i];
		if(key == '--port' || key == '-p'){
			key = '-p';
		}else if(key == '--config' || key == '-c'){
			key = '-c';
		}else if(key == '--mapping' || key == '-m'){
			key = '-m';
		}else if(key == '--stub' || key == '-s'){
			key = '-s';
		}else if(key == '-C' || key == '-d'){
			//key = '-p';
		}else{
			console.log("Invalid options");
			console.log("Try 'stubbydb --help' for more information.*/")
			process.exit(1);
		}
		options[key] = process.argv[++i];
	}
}

var configBuilder = require("./js/configbuilder");
configBuilder.buildConfig(options,process.argv.length);
var config = configBuilder.getConfig();
console.log("Configuration: " + JSON.stringify(config));


var stubbyDB = require('./js/stubbyDB');
var server = new stubbyDB();
server.start();