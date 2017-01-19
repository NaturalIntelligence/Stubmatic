#!/usr/bin/env node

var fs = require('fs');
var logger = require('./os/nushi/stubmatic/log');
var color = require('./os/nushi/stubmatic/util/colors').color;
var path = require('path');

if(process.argv[2] === "--help" || process.argv[2] === "-h"){
	console.log(fs.readFileSync(__dirname + "/man/stubmatic.1", 'utf-8'));
}else if(process.argv[2] === "--version"){
	console.log(require(__dirname + "/package.json").version);
}else if(process.argv[2] === "init"){
	require('./init').init(process.argv[3] || "stub-repo");
}else if(process.argv[2] === "validate"){
	try{
		if(process.argv[3].endsWith(".json")){
			require('jsonlint').parse(fs.readFileSync(process.argv[3], {encoding: 'utf-8'}));
			console.log("Validated successfully");
		}
		else if(process.argv[3].endsWith(".yaml") || process.argv[3].endsWith(".yml")){
			require('yamljs').parseFile(process.argv[3]);
			console.log("Validated successfully");
		}
		/*else if(process.argv[3].endsWith(".xml"))
			require('xmlchecker').check(process.argv[3]);*/
		else{
			console.log("Unsupported file");

		}

		
	}catch(e){
		console.log("Validation failed")
		console.log(color(e,'red'));
		//if(e.line) console.log("line number: " + e.line + ":" + e.column);
	}
}else{
	var isExist = function(path){
		try{
			fs.accessSync(path, fs.F_OK);
			return true;
		}catch(e){
			return false;
		}
	}

	var options = {};
	for(var i=2; i<process.argv.length;i++){
		if(process.argv[i].indexOf("-") === 0){
			var key = process.argv[i];
			if(key === '-d' ){
				if(isExist(process.argv[i+1])){
					global.basePath = process.argv[i+1];
				}else{
					global.basePath = path.join(process.cwd(),process.argv[i+1]);
				}
				options['-d'] = global.basePath; 
			}else if(key === '-v' || key === '--verbose'){
				logger.setVerbose(true);
			}else if(key === '-l' || key === '--logs'){
				logger.writeLogs(true);
			}else if(key === '--debug'){
				logger.debugLogs(true);
			}else{
				if(key === '--port' || key === '-p'){
					key = '-p';
				}else if(key === '--config' || key === '-c'){
					key = '-c';
				}else if(key === '--mapping' || key === '-m'){
					key = '-m';
				}else if(key === '--stub' || key === '-s'){
					key = '-s';
				}else if(key === '-d' || key === '-v' || key === '--host'
					|| key === '-l' || key === '-P' || key === '--mutualSSL'){
					//valid keys
				}else{
					console.log("Invalid options");
					console.log("Try 'stubmatic --help' for more information.")
					return;
				}
				options[key] = process.argv[++i];
			}
		}
	}

	var stubmatic = require('./os/nushi/stubmatic/stubmatic').stubmatic;
	stubmatic(options);
}