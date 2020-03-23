// @ts-check
var logger = require('./log');
var rx = require('axios').default;
var fs = require('fs');

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
	//delete reqOptions.headers["accept-encoding"];
	//reqOptions.gzip = true
	reqOptions.responseType = 'stream';
	reqOptions.withCredentials = true;
	// not yet supported
	reqOptions.decompress = false;
	reqOptions.maxContentLength = 1024 * 1024 * 50;
	reqOptions.maxBodyLength  = 1024 * 1024 * 50;
	reqOptions.validateStatus = function (status) {
		//return status >= 200 && status < 300; // default
		//return (status >= 200 && status < 300) || status === 304 ; // default
		return true; // default
	}

	rx.create(reqOptions).request(reqOptions)
		.then( function(response){
			logger.info("Response: " + response.status);
			logger.debug("Headers:")
			logger.debug( JSON.stringify(response.headers, null, 4) )
			cb( response)
		})
		.catch( err => {
			if (err.response) {
				logger.error("Error")
				logger.error(err.response.data)
				logger.error(err.response.headers)
			}
		})

}

