function stubbyDB(){
	console.log("Starting Server");

	this.server = require('http').createServer();
	var mappings = require('./mappings_loader').mappings;
	var reqResolver = require('./request_resolver');
	var resHandler = require('./response_handler');
	var markersHandler = require('./markers_handler');
	var dumpsHandler = require('./dumps_handler');
	var dbsetHandler = require('./dbset_handler');
	var util = require('./util/util');
	var color = require('./util/colors').color;
	var logger = require('./log');

	this.server.on('request', function(request, response) {
		  var body = [];
		  request.on('error', function(err) {
		    console.error(err);
		  }).on('data', function(chunk) {
		    body.push(chunk);
		  }).on('end', function() {
		    body = Buffer.concat(body).toString();
				

		    //Prepare response
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
				response_config = matchedEntry.response;
				request_config = matchedEntry.request;

				logger.info("Matching request Config: " + JSON.stringify(request_config));

				response.statusCode = response_config.status;
				if(response_config.headers){
					for(var header in response_config.headers){
						response.setHeader(header,response_config.headers[header]);
					}
					response.headers = response_config.headers;
				}
				
				resHandler.readResponse(matchedEntry,function(data,err){
					if(err == 404){
						response.statusCode = 404;
					}
					if(matchedEntry.dbset){
						console.log(matchedEntry.dbset.key);
						var key = util.replaceParts(matchedEntry.dbset.key,matchedEntry.request.matches);
						console.log(key);
						console.log(typeof key);
						data = dbsetHandler.replaceWithDbSetPlaceHolders(data,matchedEntry.dbset.db,key);
					}
					if(matchedEntry.request.matches){
						data = util.replaceParts(data,matchedEntry.request.matches);
					}
					data = markersHandler.replaceMarkers(data);
					data = dumpsHandler.replaceDumps(data);
					response.write(data);

					util.wait(response_config.latency);
					response.end("");

					
					if(response.statusCode == 200){
						console.log(color("Response served in " + response_config.latency + " ms with Status Code " + response.statusCode,'Green'));
					}else{
						console.log(color("Response served in " + response_config.latency + " ms with Status Code " + response.statusCode,'Red'));
					}
				});
			}catch(e){
				console.log(color(e,'Red'));
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


module.exports = stubbyDB;