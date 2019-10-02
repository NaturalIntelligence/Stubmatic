var ConfigBuilder = require('./ConfigBuilder');
var fsUtil = require('./util/fileutil');
var logger = require('./log');
var https = require('https');
var http = require('http');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');
var compressAndSend = require('./compressionHandler');
var url = require('url');

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
		requestProcessor.process(request, (data,options) => {
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
		reqOptions.body = request.post
	}
	setTimeout(function(){

		proxyModule.redirect(reqOptions, response, function(err, actualResponse, resBody){
			console.log(options.recordPath)
			//if(!err && requestProcessor.config.recordPath){
			if(!err && options.recordPath){
				let filePath = path.join(options.recordPath, String(fileNameCounter++) );
				//filePath = getAvailableFilePath(filePath, "_map.yaml");
				let mappingFilePath = filePath + "_map.yaml";
				let resFilePath = filePath + "_res";
				//record input request as mapping
				const reqResponseMapping = buildMappingFileContent(request, actualResponse);
				requestProcessor.mappings.updateMappingOptions(reqResponseMapping.request, reqResponseMapping.response);
				
				let contentType = "";
				let charset = "utf8";
				if(actualResponse.headers["content-type"]){
					const contentTypeArr = actualResponse.headers["content-type"].split(";");
					contentType = contentTypeArr[0].trim();
					if(contentTypeArr[1]){
						const contentTypeDeail = contentTypeArr[1].split('=')
						if(contentTypeDeail[0].trim() === 'charset'){
							charset = contentTypeDeail[1].trim();
						}
					}
				}
				resFilePath = `${resFilePath}${extention [ contentType ] || ""}`;
				reqResponseMapping.response.file = resFilePath;
				requestProcessor.mappings.add(reqResponseMapping);
				//save entry in mappings to avoid recall
				//TODO
				//if(Buffer.isBuffer(resBody)  || ){
					
				//resFilePath should be relative to stubs or absolute
				if(!fsUtil.isExist(resFilePath)) {
					mappingFilePath = path.join(requestProcessor.config.stubs, mappingFilePath);
					resFilePath = path.join(requestProcessor.config.stubs, resFilePath);
				}
				fs.writeFile(resFilePath, resBody, () => {
					console.debug("Response has been recorded on file system at: " +resFilePath)
				});
				// }else{
				// 	fs.writeFile(resFilePath, resBody, { encoding: charset });
				// }

				fs.writeFileSync(mappingFilePath, YAML.stringify(reqResponseMapping , 4) )
			}
		})
	},options.latency);
}


function getAvailableFilePath(orginalFilePath, ext){
	let counter = 1;
	let filePath = orginalFilePath;
	while( fsUtil.isExist(filePath + ext)) filePath = orginalFilePath + counter++;
	return filePath;
}

const skipHeaders = ["user-agent", "connection", "postman-token", "accept-encoding"]

function buildMappingFileContent(req,res){
	const mappingFileContent = {
		request: {
			method: req.method,
			url: req.url,
			headers: {}
		},
		response: {
			headers: res.headers
		}
	};
	//copy Headers
	const headerNames = Object.keys(req.headers);
	for (var headerIndex in headerNames) {
		const headerName = headerNames[headerIndex];
		if(headerName === "content-type") {
			mappingFileContent.response.contentType = res.headers["content-type"];
		}else if( skipHeaders.indexOf(headerName.toLowerCase()) > -1){
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