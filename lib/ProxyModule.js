// @ts-check
var logger = require('./log');
var r = require('request');

// --record : save the response to a file
// --debug without --record : display the response on the screen
module.exports.redirect = function(reqOptions, res, cb){

	//ignore latency due to original network delay
	r.get(reqOptions, (err, response, body) => {
		
		logger.info("Response: " + response.statusCode);
		logger.debug("Headers:")
		logger.debug(response.headers)
		if(err){
			logger.error("Error")
			logger.info(err);
		}else{
			logger.debug("Content")
			logger.debug(body)
		}
		cb(err, response,body)
	}).pipe(res)

}