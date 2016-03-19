var util = require('./util/util');

function stubbyDB(){
	console.log("Starting Server");

	this.server = require('http').createServer();
	var reqResolver = require('./request_resolver');
	var resHandler = require('./response_handler');
	var color = require('./util/colors').color;
	var logger = require('./log');

	this.server.on('request', function(request, response) {
		  var startTime = new Date();
		  var body = [];
		  request.on('error', function(err) {
		    console.error(err);
		  }).on('data', function(chunk) {
		    body.push(chunk);
		  }).on('end', function() {
		    body = Buffer.concat(body).toString();
			request['post'] = body;

			console.log(color(request.method+": "+request.url,'Green'));
			logger.info(request.method+": "+request.url);
			try{
				var matchedEntry = reqResolver.resolve(request);
				if(matchedEntry == null){
					response.statusCode = 404;
					response.end("");
					console.log(color("Response served with Status Code " + response.statusCode,'Red'));
					return;
				}
				

				logger.info("Matching request Config: " + JSON.stringify(matchedEntry.request));
				
				resHandler.readResponse(matchedEntry,function(data,err){
					response = buildResponse(response,matchedEntry.response);
					if(err == 404){
						response.statusCode = 404;
					}

					//1. replace DbSet Place Holders
					data = require('./dbset_handler').handle(data,matchedEntry.dbset);
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
						console.log(color("Response served in " + responseTime + " ms with Status Code " + response.statusCode,'Green'));
					}else{
						console.log(color("Response served in " + responseTime + " ms with Status Code " + response.statusCode,'Red'));
					}
				});
			}catch(e){
				console.log(color(e,'Red'));
				logger.error(e);
			}
		  });
	});

	this.start= function(){
		var config = require("./configbuilder").getConfig();

		this.server.listen(config.server.port,config.server.host, function(){
		    console.log("Server listening on: http://" + config.server.host + ":" + config.server.port);
		});
	}
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