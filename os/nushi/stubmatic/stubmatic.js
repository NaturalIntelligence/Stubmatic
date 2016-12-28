var util = require('./util/util');
var RequestContext = require('./RequestContext');
var config = require("./configbuilder").getConfig();
var logger = require('./log');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var mappings = require('./loaders/mappings_loader').mappings;

function networkErrHandler(err) {
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
}

var reqResolver = require('./request_resolver');
var resFileResolver = require('./response_handler');
var color = require('./util/colors').color;
var url = require('url');

function requestResponseHandler(request, response) {
	var rc = new RequestContext(request);
	var parsedURL = url.parse(request.url, true);
	request.url = parsedURL.pathname;
	request.query = parsedURL.query;

	if(request.query.debug){
		request.url = request.url.replace('debug=true','');
		response.setHeader("Content-Type","application/json");
		if(request.url[request.url.length-1] == '?'){
			request.url = request.url.substr(0,request.url.length -1);
		}

		if(request.url == '/'){
			rc.scriptLocation = __dirname;
			rc.config = config;
			rc.projectPath = global.basePath;
			var os = require('os');
			rc.memory = {};
			rc.memory.total = os.totalmem();
			rc.memory.free = os.freemem();
			rc.hostname = os.hostname();
		}
	}

	  var body = [];
	  request.on('error', function(err) {
	  	logger.error(msg);
	  }).on('data', function(chunk) {
	    body.push(chunk);
	  }).on('end', function() {
	    body = Buffer.concat(body).toString();
		request['post'] = body;

		logger.info(rc.getTransactionId() + " " + request.method+": "+request.url,'success');
		try{
			var matchedEntry = reqResolver.resolve(request);
			logger.debug(rc.getTransactionId() + " after reqResolver : " + rc.howLong() + " ms");

			rc.matchedMapping = matchedEntry;

			if(matchedEntry == null){
				response.statusCode = 404;
				if(request.query.debug){
					response.end(JSON.stringify(rc));
				}else{
					response.end("");	
				}
				
				logger.error(rc.getTransactionId() + " Response served with Status Code " + response.statusCode);
				return;
			}
			
			logger.detailInfo(rc.getTransactionId() + " Matching Config: " + JSON.stringify(mappings[matchedEntry.index]));
			var sendAsAttachment = matchedEntry.response.contentType;
			
			
			var status = matchedEntry.response.status;

			//Set Headers
			if(matchedEntry.response.headers){
				for(var header in matchedEntry.response.headers){
					response.setHeader(header,matchedEntry.response.headers[header]);
				}
				response.headers = matchedEntry.response.headers;
			}

			var data = "";
			//Read and Build Response body
			if(matchedEntry.response.body){
				data = matchedEntry.response.body;
				data = handleDynamicResponseBody(data,matchedEntry);
				logger.debug(rc.getTransactionId() + " after handleDynamicResponse Body : " + rc.howLong() + " ms");
			}else{
					logger.debug(rc.getTransactionId() + " before readResponse : " + rc.howLong() + " ms");
				var dataFile = resFileResolver.readResponse(matchedEntry);
					logger.debug(rc.getTransactionId() + " after readResponse : " + rc.howLong() + " ms");
				if(typeof dataFile  === 'object'){

					status =  dataFile.status;
					dataFile = dataFile.name;
					logger.info(dataFile.name);
				}
				
				logger.info('Reading from file: ' + dataFile);
				
				if(!sendAsAttachment){
					data = fs.readFileSync(dataFile, {encoding: 'utf-8'});
						logger.debug(rc.getTransactionId() + " after readFileSync : " + rc.howLong() + " ms");
						//rc.rawResponse(data);
					data = handleDynamicResponseBody(data,matchedEntry);
						//rc.refinedResponse(data);
						logger.debug(rc.getTransactionId() + " after handleDynamicResponse File : " + rc.howLong() + " ms");
				}else{
					data = dataFile;
				}
			}

			//Set Response Code
			response.statusCode = status;

			if(request.query.debug){
				response.end(JSON.stringify(rc));
				return;
			}
			//Latency
			logger.debug("RequestContext: " + JSON.stringify(rc));
			setTimeout(function(){
				sendResponse(response,data,sendAsAttachment,request.headers['accept-encoding']);	
				logger.debug(rc.getTransactionId() + " after sendResponse : " + rc.howLong() + " ms");
			
				if(response.statusCode == 200){
					logger.info(rc.getTransactionId() + " Response served in " + rc.howLong() + " ms with Status Code " + response.statusCode,'success');
				}else{
					logger.info(rc.getTransactionId() + " Response served in " + rc.howLong() + " ms with Status Code " + response.statusCode,'fail');
				}
			},calculateLatency(matchedEntry.response.latency));
		}catch(e){
			logger.error(e);
			response.statusCode = 500;
			response.end("");
		}
	  });
}

function stubmatic(){

	if(config.server.securePort){
		
		const options = {
		  key: fs.readFileSync(config.server.key),
		  cert: fs.readFileSync(config.server.cert)
		};
		if(config.server.ca){
			options.ca = [];
			config.server.ca.forEach(function(cert){
				options.ca.push(fs.readFileSync(cert));
			});
		}
		if(config.server.mutualSSL === true){
			options.requestCert= true;
  			options.rejectUnauthorized= true;
		}
		require('https').createServer(options, requestResponseHandler).listen(config.server.securePort,config.server.host, function(){
		    logger.info("Secure server listening on: https://" + config.server.host + ":" + config.server.securePort);

		});
	}

	if(config.server.port){
		this.server = require('http').createServer();
		this.server.on('error', networkErrHandler );
		this.server.on('request', requestResponseHandler);
		this.server.listen(config.server.port,config.server.host, function(){
		    logger.info("Server listening on: http://" + config.server.host + ":" + config.server.port);
		});
	}
}

function handleDynamicResponseBody(data,matchedEntry){
	//1. replace DbSet Place Holders
	data = require('./dbset_handler').handle(data,matchedEntry.dbset);
	//2. replace request matches
	data = reqResolver.applyMatches(data,matchedEntry.request.matches);
	//3. replace markers
	data = require('./expressions_handler').handle(data);
	//4. replace dumps
	data = require('./dumps_handler').handle(data);

	return data;
}

function calculateLatency(latency){
	if(Array.isArray(latency)){
		return util.getRandomInt(latency[0],latency[1])
	}
	return latency;
}

function sendResponse(response,data,sendAsAttachment,encodingType){
	if(!sendAsAttachment){
		if(encodingType){
			if(encodingType.indexOf('gzip') > -1){
				response.setHeader('content-encoding','gzip');
				response.write(zlib.gzipSync(data));
			}else if(encodingType.indexOf('deflate') > -1){
				response.setHeader('content-encoding','deflate');
				response.write(zlib.deflateSync(data));
			}
		}else{
			response.write(data);
		}
		response.end("");	
	}else{
		response.setHeader("Content-Type",sendAsAttachment);
		//response.setHeader("Content-Length",len);
		var rstream = fs.createReadStream(data);//data is filename in this case

		if(encodingType){
			if(encodingType.indexOf('gzip') > -1){
				response.setHeader('content-encoding','gzip');
				rstream.pipe(zlib.createGzip()).pipe(response);
				//response.write(zlib.gzipSync(data));
			}else if(encodingType.indexOf('deflate') > -1){
				response.setHeader('content-encoding','deflate');
				rstream.pipe(zlib.createDeflate()).pipe(response);
				//response.write(zlib.deflateSync(data));
			}
		}else{
			rstream.pipe(response);
		}
	}
}

module.exports = stubmatic;