var ConfigBuilder = require('./ConfigBuilder');
var fsUtil = require('./util/fileutil');
var logger = require('./log');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var url = require('url');

var color = require('./util/colors').color;
var bold = require('./util/colors').bold;
const RequestProcessor = require("./RequestProcessor");
const proxyModule = require("./ProxyModule");
const extention = require("./fileExtentionMapping");
const YAML = require("yamljs");


module.exports = class StubmaticServer{
	constructor(options){
		const configBuilder = new ConfigBuilder();
		this.config = configBuilder.build(options);
		

		if(this.config.server.httpsOptions){
			this.secureServer = https.createServer( this.config.server.httpsOptions );
		}
	
		if(this.config.server.port){
			this.server = http.createServer();
		}
	}

	on(eventName, callback){
		if(eventName === 'start'){
			this.onStart = callback;
		}else if(eventName === 'error'){
			this.onError = callback;
		}else{
			logger.error("invalid event passed");
		}
	}

	start(){
		if(this.config.server.httpsOptions){
			this._start(this.secureServer,this.config.server.httpsOptions.port,'https');
		}
	
		if(this.config.server.port){
			this._start(this.server,this.config.server.port,'http');
		}
	};

	_start(server,port,protocol){
		const host = this.config.server.host;
		server.on('error', err => {
			if(this.onError) this.onError(err);
			networkErrHandler(err,port,host);
		});
		const requestProcessor = new RequestProcessor(this.config); //it'll load data tables and mappings
		const recordPath = this.config.recordPath;

		server.on('request', function(req,res){
			requestResponseHandler(req,res, requestProcessor, recordPath)
		});
		server.listen(port,host, function(){
			if(this.onStart) this.onStart();

			console.log("Cool DOWN server is UP: "+protocol+"://" + host + ":" + port);
			console.log('');
			console.log('Try '+ color('BigBit standard',"light_green") +' for numeric data without precision loss. And for single character endoding');
			console.log('Give us a '+bold('*')+' on '+ color('https://github.com/NaturalIntelligence/Stubmatic', "light_blue") +' and help us to grow');
			console.log('');
		});
	}

	
}

// this.stop = function(){
// 	this.secureServer || this.secureServer.close();
// 	this.server || this.server.close();
// };


function networkErrHandler(err,port,host) {
	var msg;
	switch (err.code) {
	    case 'EACCES':
	      msg = 'EACCES: Permission denied to use port ' + port;
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
	console.log(color(msg,'red'));
	//throw new Error(msg);
}

function requestResponseHandler(request, response, requestProcessor, recordPath) {
		
	request.originalUrl = request.url;
	var parsedURL = url.parse(request.url, true);
	request.url = parsedURL.pathname;
	request.query = parsedURL.query;
	//TODO P3: hash is not implemented yet
	//request.hash = parsedURL.hash;

	var body = [];
	request.on('error', function(err) {
		logger.error(msg);
	}).on('data', function(chunk) {
	body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();
		request.post = body;
		logger.debug("Raw request body: " + body);
		requestProcessor.process(request, (data,options) => {
			if(options.proxy){
				redirect(request, response, recordPath, data, options);
			}else{
				response.statusCode = options.status;
				if(options.headers){
					for(var header in options.headers){
						response.setHeader(header.toLowerCase(),options.headers[header]);
					}
				}

				setTimeout(function(){
					sendResponse(response,data,options,request.headers['accept-encoding']);
					//logger.info("with delay of "+ options.latency + "ms");	
				},options.latency);
			}
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
function sendResponse(response,data,opt,encodingType){
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

	if(!opt.sendasfile){

		if(gzip) data = zlib.gzipSync(data);
		else if(deflate) data = zlib.deflateSync(data);
		
		response.write(data);
		response.end("");	
	}else{
		if(fsUtil.isExist(data)){
			var rstream = fs.createReadStream(data);//data is filename in this case

			if(gzip) rstream.pipe(zlib.createGzip()).pipe(response);
			else if(deflate) rstream.pipe(zlib.createDeflate()).pipe(response);
			else rstream.pipe(response);
		}else{
			logger.error(data + " doesn't exist");
			response.removeHeader("content-type");
			response.statusCode = 500;
			response.end("");
		}
	}
}

function redirect(request, response, recordPath, baseUrl, options){
	const targetUrl = url.resolve(baseUrl, request.originalUrl);
	const reqOptions = {
		url: targetUrl,
		method: request.method,
		headers: request.headers
	}
	if(request.post){
		reqOptions.body = request.post
	}
	setTimeout(function(){

		proxyModule.redirect(reqOptions, response, function(err, actualResponse, resBody){
			if(!err && recordPath){
				let filePath = path.join(recordPath, request.originalUrl.replace("/", "_"));
				filePath = getAvailableFilePath(filePath, "_map");
				const mappingFilePath = filePath + "_map";
				const resFilePath = filePath + "_res";
				//record input request as mapping
				fs.writeFileSync(mappingFilePath, YAML.stringify(buildMappingFileContent(request, actualResponse), 4) )
				//record response
				actualResponse.pipe(
					fs.createWriteStream(
						`${resFilePath}_response${extention [actualResponse.headers("content-type") ]}`
					)
				)
			}
		})
	},options.latency);
}

function getAvailableFilePath(filePath, ext){
	let counter = 1;
	while( !fsUtil.isExist(filePath + ext)) 
		filePath += counter;
	return filePath;
}

function buildMappingFileContent(req,res){
	const mappingFileContent = {
		request: {
			method: req.method,
			url: req.url,
			headers: req.headers
		},
		response: {
			status: 200,
			latency: 0,
			headers: res.headers,
			contentType: res.headers("content-type")
		}
	};
	if(req.query){
		mappingFileContent.request.query = req.query;
	}
	return mappingFileContent;
}