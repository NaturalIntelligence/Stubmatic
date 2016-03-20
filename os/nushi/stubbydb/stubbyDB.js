var util = require('./util/util');
var config = require("./configbuilder").getConfig();
var logger = require('./log');
var dbHandler = require('./dbset_handler');

function stubbyDB(){
	this.server = require('http').createServer();

	this.server.on('error', function(err) {
		var msg;
		switch (err.code) {
		    case 'EACCES':
		      msg = 'Permission denied for use of port ' + config.server.port;
		      break;
		    case 'EADDRINUSE':
		      msg = 'Port ' + config.server.port + ' is already in use.';
		      break;
		    case 'EADDRNOTAVAIL':
		      msg = 'Host "' + config.server.host + '" is not available.';
		      break;
		    default:
		      msg = err.message;
		}
		logger.error(msg);
		process.exit();
	});

	var reqResolver = require('./request_resolver');
	var resHandler = require('./response_handler');
	var color = require('./util/colors').color;
	

	this.server.on('request', function(request, response) {
		  var startTime = new Date();
		  var body = [];
		  request.on('error', function(err) {
		  	logger.error(msg);
		  }).on('data', function(chunk) {
		    body.push(chunk);
		  }).on('end', function() {
		    body = Buffer.concat(body).toString();
			request['post'] = body;

			//console.log(color(request.method+": "+request.url,'Green'));
			logger.info(request.method+": "+request.url,'success');
			try{
				var matchedEntry = reqResolver.resolve(request);
				if(matchedEntry == null){
					response.statusCode = 404;
					response.end("");
					logger.error("Response served with Status Code " + response.statusCode);
					return;
				}
				

				logger.detailInfo("Matching request Config: " + JSON.stringify(matchedEntry.request));
				
				resHandler.readResponse(matchedEntry,function(data,err){
					response = buildResponse(response,matchedEntry.response);
					if(err == 404){
						response.statusCode = 404;
					}

					//1. replace DbSet Place Holders
					data = dbHandler.handle(data,matchedEntry.dbset);
					//2. replace request matches
					data = reqResolver.applyMatches(data,matchedEntry.request.matches);
					//3. replace markers
					data = require('./markers_handler').handle(data);
					//4. replace dumps
					data = require('./dumps_handler').handle(data);
					response.write(data);
					response.end("");

					var responseTime = (new Date()) - startTime;
					if(response.statusCode == 200){
						logger.info("Response served in " + responseTime + " ms with Status Code " + response.statusCode,'success');
					}else{
						logger.info("Response served in " + responseTime + " ms with Status Code " + response.statusCode,'fail');
					}
				});
			}catch(e){
				logger.error(e);
			}
		  });
	});

	this.server.listen(config.server.port,config.server.host, function(){
	    logger.info("Server listening on: http://" + config.server.host + ":" + config.server.port);
	});
}

function buildResponse(response,config){
	util.wait(config.latency);
	response.statusCode = config.status;
	if(config.headers){
		for(var header in config.headers){
			response.setHeader(header,config.headers[header]);
		}
		response.headers = config.headers;
	}

	return response;
}

module.exports = stubbyDB;