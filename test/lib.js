const assert = require('assert');
var chalk = require('chalk');

exports.assert = function(actual,expected){
	try{
		assert.deepEqual(actual,expected);
		console.log(chalk.green('PASS'));
	}catch(e){
		console.log(chalk.red('FAIL'));
		console.log("Actual: " + JSON.stringify(actual))
		console.log("is not matching with")
		console.log("Expected: " + JSON.stringify(expected))
		console.log();
	}
}