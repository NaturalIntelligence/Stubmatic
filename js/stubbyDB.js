function stubbyDB(){
	console.log("Starting Server");

	this.server = require('http').createServer();
	var mappings = require('./req_res_mappings').mappings;
	var reqHandler = require('./request_handler');
	var resHandler = require('./response_handler');
	var util = require('./util');
	var color = require('./colors').color;
	var logger = require('./log');

	this.server.on('request', function(request, response) {
	  	  var headers = request.headers;
		  var method = request.method;
		  var url = request.url;
		  
		  var body = [];
		  request.on('error', function(err) {
		    console.error(err);
		  }).on('data', function(chunk) {
		    body.push(chunk);
		  }).on('end', function() {
		    body = Buffer.concat(body).toString();
				

		    //Prepare response
			request['post'] = body;

			console.log(color(method+": "+url,'Green'));
			logger.info(method+": "+url);
			try{
				var req_context = reqHandler.parseRequest(request,mappings);
				if(req_context == null){
					response.statusCode = 404;
					response.end("");
					console.log(color("Response served with Status Code " + response.statusCode,'Red'));
					return;
				}
				var matchingmapping = mappings[req_context.matchedConfigIndex];
				response_config = matchingmapping.response;
				request_config = matchingmapping.request;

				logger.info("Matching request Config: " + JSON.stringify(request_config));

				response.statusCode = response_config.status;
				if(response_config.headers){
					for(var header in response_config.headers){
						response.setHeader(header,response_config.headers[header]);
					}
					response.headers = response_config.headers;
				}
				
				resHandler.readResponse(response_config,req_context,function(data,err){
					if(err == 404){
						response.statusCode = 404;
					}
					if(matchingmapping.dbset){

						var key = util.replaceParts(matchingmapping.dbset.key,req_context.parts);
						data = util.replaceWithDataSetPlaceHolders(data,matchingmapping.dbset.db,key);
					}
					if(req_context.parts){
						data = util.replaceParts(data,req_context.parts);
					}
					data = util.replaceMarkers(data);
					data = util.replaceDumps(data);
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