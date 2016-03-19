const assert = require('assert');
var color = require('../os/nushi/stubbydb/util/colors').color;

exports.assert = function(actual,expected){
	try{
		assert.deepEqual(actual,expected);
		console.log(color('PASS','green'));
	}catch(e){
		console.log(color('FAIL','red'));
		console.log("Actual: " + JSON.stringify(actual))
		console.log("is not matching with")
		console.log("Expected: " + JSON.stringify(expected))
		console.log();
	}
}