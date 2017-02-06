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
		var server = require('./lib/server');
		server.setup(options);
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
		}
		/*else if(fileName.endsWith(".xml"))
			require('xmlchecker').check(fileName);*/
		else {
			console.log("Unsupported file");
		}
	} catch (e) {
		console.log("Validation failed")
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
				if (isExist(args[i + 1])) {
					global.basePath = args[i + 1];
				} else {
					global.basePath = path.join(process.cwd(), args[i + 1]);
				}
				options['-d'] = global.basePath;
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
				} else if (key === '--mapping' || key === '-m') {
					key = '-m';
				} else if (key === '--stub' || key === '-s') {
					key = '-s';
				} else if (key === '-d' || key === '-v' || key === '--host' ||
					key === '-l' || key === '-P' || key === '--mutualSSL') {
					//valid keys
				} else {
					console.log("Invalid options");
					console.log("Try 'stubmatic --help' for more information.")
					return;
				}
				options[key] = args[++i];
			}
		}
	}
	return options;
}

var isExist = function (filepath) {
	try {
		fs.accessSync(filepath, fs.F_OK);
		return true;
	} catch (e) {
		return false;
	}
}


cli(process.argv);