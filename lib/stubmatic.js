if(process.env.OPBEAT_APP_ID){
	var opbeat = require('opbeat').start({
	appId: process.env.OPBEAT_APP_ID,
	organizationId: process.env.OPBEAT_ORG_ID,
	secretToken: process.env.OPBEAT_TOKEN,
	});
}

var util = require('./util/util');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var url = require('url');

var RequestContext = require('./RequestContext');
var configBuilder = require("./configbuilder");
var logger = require('./log');
var expEngine = require('./expressions/engine')
var dbSetLoader = require('./loaders/dbset_loader');
var mappingsLoader = require('./loaders/mappings_loader');
var reqResolver = require('./request_resolver');
var resFileResolver = require('./response_handler');
var color = require('./util/colors').color;

var https = require('https');
var http = require('http');
var config, mappings;

exports.stubmatic = function(opt,callback){
	configBuilder.build(opt);
	config = configBuilder.getConfig();
	logger.debug(JSON.stringify(config,null,4));
	mappings = mappingsLoader.buildMappings(config);
	dbSetLoader.load();

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
		this.secureServer = https.createServer(options);
		serverStart(this.secureServer,config.server.securePort,'https',callback);
	}

	if(config.server.port){
		this.server = http.createServer();
		serverStart(this.server,config.server.port,'http',callback);
	}

}

function serverStart(server,port,type,callback){
	server.on('error', networkErrHandler );
	server.on('request', requestResponseHandler);
	server.listen(port,config.server.host, function(){
	    logger.info("Server listening on: "+type+"://" + config.server.host + ":" + port);
	    if(callback) callback(this);
	});
}

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

/**
Handle incoming request
**/
function requestResponseHandler(request, response) {

	var parsedURL = url.parse(request.url, true);
	request.url = parsedURL.pathname;
	request.query = parsedURL.query;

	  var body = [];
	  request.on('error', function(err) {
	  	logger.error(msg);
	  }).on('data', function(chunk) {
	    body.push(chunk);
	  }).on('end', function() {
	    body = Buffer.concat(body).toString();
		request.post = body;

		processRequest(request,(data,options) => {
			response.statusCode = options.status;
			if(options.headers){
				for(var header in options.headers){
					response.setHeader(header.toLowerCase(),options.headers[header]);
				}
			}

			setTimeout(function(){
				sendResponse(response,data,options.sendasfile,request.headers['accept-encoding']);	
			},options.latency);

		},(data,options) => {
			response.statusCode = options.status;
			response.write(data);
			response.end("");
		})
	  });
}

/*
response: HTTP response object
data: response data or fileNamePath
isFile: set to 'true' if 'data' is fileNamePath
encodingType: value of request header parameter "content-encoding"
*/
function sendResponse(response,data,isFile,encodingType){
	var gzip = false, deflate = false;
	if(encodingType){
		if(encodingType.indexOf('gzip') > -1){
			response.setHeader('content-encoding','gzip');
			gzip = true;
		}else if(encodingType.indexOf('deflate') > -1){
			response.setHeader('content-encoding','deflate');
			deflate = true;
		}
	}

	if(!isFile){
		if(gzip) data = zlib.gzipSync(data);
		else if(deflate) data = zlib.deflateSync(data);
		
		response.write(data);
		response.end("");	
	}else{
		var rstream = fs.createReadStream(data);//data is filename in this case

		if(gzip) rstream.pipe(zlib.createGzip()).pipe(response);
		else if(deflate) rstream.pipe(zlib.createDeflate()).pipe(response);
		else rstream.pipe(response);
	}
}

/*
1) Find matching mapping
2) Resolve response file/body
3) Process response data (resolve expressions and request captured part)
*/
var processRequest = function(request,onSuccess,onError){
	
	var rc = new RequestContext(request);
	logger.info(rc.getTransactionId() + " " + request.method+": "+request.url,'green');
	rc.requestBody = request.post;
	try{
		var matchedEntry = reqResolver.resolve(request,mappings);
		logger.debug(rc.getTransactionId() + " after resolving the request : " + rc.howLong() + " ms");
		rc.resolved = matchedEntry;

		if(!matchedEntry || matchedEntry === null){
			logger.debug(JSON.stringify(rc, null, "\t"));
			logger.error(rc.getTransactionId() + " Response served with Status Code 404 ");
			return onError("",{ status : 404});
		}else{
			var options = {};
			logger.detailInfo(rc.getTransactionId() + " Matching Config: " + JSON.stringify(mappings[matchedEntry.index],null,4));
		
			//Set Headers
			options.headers = matchedEntry.response.headers;
			options.status = matchedEntry.response.status;
			options.latency = calculateLatency(matchedEntry.response.latency);
			var data = "";

			//Read and Build Response body
			if(matchedEntry.response.body){
				data = matchedEntry.response.body;
				logger.debug(rc.getTransactionId() + " before processing data");
				data = handleDynamicResponseBody(data,rc);
				logger.debug(rc.getTransactionId() + " after processing response body : " + rc.howLong() + " ms");
			}else{
				var dataFile = resFileResolver.readResponse(matchedEntry);
				if(typeof dataFile  === 'object'){
					options.status =  dataFile.status;
					dataFile = dataFile.name;
				}
				
				logger.info('Reading from file: ' + dataFile);
				if(matchedEntry.response.sendas && matchedEntry.response.sendas === "file"){
					data = dataFile;
					options.sendasfile = true;
				}else{
					data = fs.readFileSync(dataFile, {encoding: 'utf-8'});
						logger.debug(rc.getTransactionId() + " after reading from file : " + rc.howLong() + " ms");
					data = handleDynamicResponseBody(data,rc);
						logger.debug(rc.getTransactionId() + " after processing response body File : " + rc.howLong() + " ms");
				}
			}

			logger.debug("RequestContext: " + JSON.stringify(rc, null, "\t"));
			onSuccess(data,options);
			var msgStr = rc.getTransactionId() + " Response served in " + rc.howLong() + " ms with Status Code " + options.status;
			options.status === 200 ? logger.info(msgStr,'green') : logger.error(msgStr) ;
		}
	}catch(e){
		logger.error(e);
		onError("",{ status : 500},e);
	}
}

function hasContentType(headers){
	for(var header in headers){
		if(header.toLowerCase() === "content-type") return true;
	}
	return false;
}

function handleDynamicResponseBody(data,rc){
	//1. replace DbSet Place Holders
	data = require('./dbset_handler').handle(data,rc.resolved.dbset);
	//2. replace request matches
	data = util.applyMatches(data,rc.resolved.request.matches);
	//3. replace markers
	data = expEngine.process(data,expEngine.fetch(data),rc);
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

//module.exports = stubmatic;