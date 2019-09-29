// @ts-check
var logger = require('./log');
var r = require('request');

// --record : save the response to a file
// --debug without --record : display the response on the screen
module.exports.redirect = function(reqOptions, res, cb){

	//ignore latency due to original network delay
	//reqOptions.followAllRedirects = true;
	//reqOptions.followRedirect = true;
	if(reqOptions.headers.host){
		delete reqOptions.headers.host;
	}
	logger.debug("Request Options for given target: " + JSON.stringify(reqOptions,null, 4) )
	r(reqOptions, (err, response, body) => {
		if(response){
			logger.info("Response: " + response.statusCode);
			logger.debug("Headers:")
			logger.debug(JSON.stringify(response.headers, null, 4) )
			if(err){
				logger.error("Error")
				logger.info(err);
			}else{
			}
			logger.debug("Content")
			logger.debug(body)
			cb(err, response, body)
		}
	}).pipe(res)

}