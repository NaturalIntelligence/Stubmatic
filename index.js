#!/usr/bin/env node
var fs = require('fs');
var logger = require('./lib/log');
var color = require('./lib/util/colors').color;
var path = require('path');
function cli(args) {
	if (args[2] === "--help" || args[2] === "-h") {
		console.log(fs.readFileSync(__dirname + "/man/stubmatic.1", 'utf-8'));
	} else if (args[2] === "--version") {
		console.log(require(__dirname + "/package.json").version);
	} else if (args[2] === "init") {
		require('./init').init(args[3] || "stub-repo");
	} else if (args[2] === "validate") {
		validateSyntax(args[3]);
	} else {
		var options = buildServerOptions(args);
		var StubmaticServer = require('./lib/server');
		const server = new StubmaticServer(options);
		server.start();
	}
}

function validateSyntax(fileName) {
	try {
		if (fileName.endsWith(".json")) {
			require('jsonlint').parse(fs.readFileSync(fileName, {
				encoding: 'utf-8'
			}));
			console.log("Validated successfully");
		} else if (fileName.endsWith(".yaml") || fileName.endsWith(".yml")) {
			require('yamljs').parseFile(fileName);
			console.log("Validated successfully");
		}else if(fileName.endsWith(".xml")){
			var result = require('fast-xml-parser').validate(fs.readFileSync(fileName, {
				encoding: 'utf-8'
			}));
			if(result === true) {
				console.log("Validated successfully");
			}else{
				console.log("Validation failed");
			}
		}else {
			console.log("Unsupported file");
		}
	} catch (e) {
		console.log("Validation failed");
		console.log(color(e, 'red'));
		//if(e.line) console.log("line number: " + e.line + ":" + e.column);
	}
}

function buildServerOptions(args) {
	var options = {};
	for (var i = 2; i < args.length; i++) {
		if (args[i].indexOf("-") === 0) {
			var key = args[i];
			if (key === '-d') {
				var dirpath =  args[++i];
				if (isExist(dirpath)) {
					global.basePath = dirpath;
				} else {
					global.basePath = path.join(process.cwd(), dirpath);
				}
				options[key] = global.basePath;
			} else if (key === '--target') { // target URL
				options[key] = args[++i];
			} else if (key === '--record') { //only valid in case of target URL
				options[key] = args[++i];
			} else if (key === '-v' || key === '--verbose') {
				logger.setVerbose(true);
			} else if (key === '-l' || key === '--logs') {
				logger.writeLogs(true);
			} else if (key === '--debug') {
				logger.debugLogs(true);
			} else {
				if (key === '--port' || key === '-p') {
					key = '-p';
				} else if (key === '--config' || key === '-c') {
					key = '-c';
				} else if (key === '--host' || key === '-P' || key === '--mutualSSL') {
					//valid keys
				} else {
					console.log("Invalid options");
					console.log("Try 'stubmatic --help' for more information.");
					throw new Error("Invalid options");
				}
				options[key] = args[++i];
			}
		}
	}

	// if( ( !options["--target"] && options["--record"])){
	// 	console.log("Invalid options");
	// 	throw new Error("'--record' option is valid only with '--target' option");
	// }
	return options;
}

var isExist = function (filepath) {
	try {
		fs.accessSync(filepath, fs.F_OK);
		return true;
	} catch (e) {
		return false;
	}
};


cli(process.argv);