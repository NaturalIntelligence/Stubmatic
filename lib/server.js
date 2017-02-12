var configBuilder = require("./configbuilder");
var dbSetLoader = require('./loaders/dbset_loader');
var mappingsLoader = require('./loaders/mappings_loader');
var logger = require('./log');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var url = require('url');

this.setup = function(opt){
	configBuilder.build(opt);
	this.config = configBuilder.getConfig();
	logger.debug(JSON.stringify(this.config,null,4));

	if(this.config.server.securePort){
		this.secureServer = https.createServer(buildSecureServerConfig(this.config));
	}

	if(this.config.server.port){
		this.server = http.createServer();
	}
};

this.start = function(){
	dbSetLoader.load();
	mappingsLoader.buildMappings(this.config);
	if(this.config.server.securePort){
		serverStart(this.secureServer,this.config.server.securePort,'https',this.config.server.host,this.onStart, this.onError);
	}

	if(this.config.server.port){
		serverStart(this.server,this.config.server.port,'http',this.config.server.host,this.onStart, this.onError);
	}
};

// this.stop = function(){
// 	this.secureServer || this.secureServer.close();
// 	this.server || this.server.close();
// };

module.exports = this;

function buildSecureServerConfig(config){
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

    return options;
}

//TODO: reduce number of args
function serverStart(server,port,type,host,onS,onE){
	server.on('error', err => {
		if(onE !== undefined){
			onE.call(this,err);
		}
		networkErrHandler(err,port,host);
	});
	server.on('request', requestResponseHandler);
	server.listen(port,host, function(){
		if(onS !== undefined){
			onS.call(this);
		}
	    logger.info("Server listening on: "+type+"://" + host + ":" + port);
	});
}

function networkErrHandler(err,port,host) {
	var msg;
	switch (err.code) {
	    case 'EACCES':
	      msg = 'EACCES: Permission denied for use of port ' + port;
	      break;
	    case 'EADDRINUSE':
	      msg = 'EADDRINUSE: Port ' + port + ' is already in use.';
	      break;
		case 'ENOTFOUND':
	      msg = err.code + 'EADDRNOTAVAILD: Host "' + host + '" is not available.';
	      break;
	    default:
	      msg = err.message;
	}
	logger.error(msg);
	throw new Error(msg);
}

this.on = function(event,callback){
	if(event === 'start'){
		this.onStart = callback;
	}else if(event === 'error'){
		this.onError = callback;
	}else{
		logger.error("invalid event passed");
	}
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

		require("./stubmatic").processRequest(request,(data,options) => {
			response.statusCode = options.status;
			if(options.headers){
				for(var header in options.headers){
					response.setHeader(header.toLowerCase(),options.headers[header]);
				}
			}

			setTimeout(function(){
				sendResponse(response,data,options.sendasfile,request.headers['accept-encoding']);
				//logger.info("with delay of "+ options.latency + "ms");	
			},options.latency);

		},(data,options,err) => {
			response.statusCode = options.status;
			response.write(data);
			response.end("");
		});
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