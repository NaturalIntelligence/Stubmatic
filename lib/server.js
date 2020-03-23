const intoStream = require('into-stream');
var ConfigBuilder = require('./ConfigBuilder');
var fsUtil = require('./util/fileutil');
var util = require('./util/util');
var logger = require('./log');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var compressAndSend = require('./compressionHandler');
var uncompressAndSave = require('./proxyResponseHandler');
var url = require('url');
var pump = require('pump')

var color = require('./util/colors').color;
var bold = require('./util/colors').bold;
const RequestProcessor = require("./RequestProcessor");
const proxyModule = require("./ProxyModule");
const extention = require("./fileExtentionMapping");
const YAML = require("yamljs");

let fileNameCounter = 0;
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

		server.on('request', function(req,res){
			requestResponseHandler(req,res, requestProcessor)
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

function requestResponseHandler(request, response, requestProcessor) {
		
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
		requestProcessor.process(request, response, (data,options) => {
			if(options.from){
				redirect(request, response, requestProcessor, data, options);
			}else{
				response.statusCode = options.status;
				if(options.headers){
					for(var header in options.headers){
						response.setHeader(header.toLowerCase(),options.headers[header]);
					}
				}

				setTimeout(function(){
					compressAndSend(response,data,options,request.headers['accept-encoding']);
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

function redirect(request, response, requestProcessor, baseUrl, options){
	const targetUrl = url.resolve(baseUrl, request.originalUrl);
	const reqOptions = {
		url: targetUrl,
		method: request.method,
		headers: request.headers
	}
	if(request.post){
		reqOptions.data = request.post;
	}
	setTimeout(function(){

		proxyModule.redirect(reqOptions, response, function( responseRecieved){
			if (options.recordAndPlay) {
				
				//record input request as mapping
				const reqResponseMapping = buildMappingFileContent(request, responseRecieved, options);
				requestProcessor.mappings.updateMappingOptions(reqResponseMapping.request, reqResponseMapping.response);
				
				//url can be so long as file name so taking only starting 30 chars.
				const fileDetail = util.fileNameFromUrl(request.url, 30);
				if(!fileDetail.ext){
					let contentType = extractContentType(responseRecieved.headers["content-type"]);
					fileDetail.ext = extention [ contentType ] || "";
				}
				//resFilePath should be relative to stubs or absolute
				let recordingPath = options.recordAndPlay.path;
				if(!fsUtil.isExist(recordingPath)) {//not absolute
					recordingPath = path.join(requestProcessor.config.stubs, recordingPath);
				}
				let filePath = path.join(recordingPath, "_" + fileDetail.name + "_" + String(Date.now()) );
				let mappingFilePath = filePath + "_map.yaml";
				let resFilePath = filePath + "_res" + fileDetail.ext;
				
				reqResponseMapping.response.file = resFilePath;
				requestProcessor.mappings.add(reqResponseMapping);

				//TODO: write async
				fs.writeFileSync(mappingFilePath, YAML.stringify([reqResponseMapping] , 4) )
				uncompressAndSave(response, responseRecieved, resFilePath)

			}else{
				//response back with whatever response is received
				response.headers = responseRecieved.headers;
				response.statusCode = responseRecieved.status;
				pump( responseRecieved.data, response)
			}
		})
	},options.latency);
}

const skipHeaders = ["user-agent", "connection", "postman-token", "accept-encoding", "host", "referer"]

function buildMappingFileContent(req,res, options){
	const mappingFileContent = {
		request: {
			method: req.method,
			url: req.url,
			headers: {}
		},
		response: {
			headers: res.headers,
			skipProcessing: true,
			status: res.status
		}
	};
	//copy Headers
	const headerNames = Object.keys(req.headers);
	let headersToSkip = options.recordAndPlay.skipHeaders || skipHeaders
	for (var headerIndex in headerNames) {
		const headerName = headerNames[headerIndex];
		if(headerName === "content-type") {
			mappingFileContent.response.contentType = res.headers["content-type"];
		}else if( headersToSkip.indexOf(headerName.toLowerCase()) > -1){
				continue;
		}
		mappingFileContent.request.headers[headerName] = escapeRegExp(req.headers[headerName]);
	}
	if(Object.keys(req.query).length > 0){
		mappingFileContent.request.query = req.query;
	}
	return mappingFileContent;
}

//if the mapped request header value contains regex char then result is unexpected
function escapeRegExp(string) {
	return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

function extractContentType(contentTypeHeader){
	let contentType = "";
	let charset = "utf8";
	if(contentTypeHeader){
		const contentTypeArr = contentTypeHeader.split(";");
		contentType = contentTypeArr[0].trim();
		/* if(contentTypeArr[1]){
			const contentTypeDeail = contentTypeArr[1].split('=')
			if(contentTypeDeail[0].trim() === 'charset'){
				charset = contentTypeDeail[1].trim();
			}
		} */
	}
	return contentType;
}