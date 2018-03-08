var util = require('./util/util');
var fs = require('fs');

var RequestContext = require('./RequestContext');
var logger = require('./log');
var expEngine = require('./expressions/engine')
var reqResolver = require('./request_resolver');
var resFileResolver = require('./strategy_handler');
var color = require('./util/colors').color;


/**
1) Find matching mapping
2) Resolve response file/body
3) Process response data (resolve expressions and request captured part)
**/
exports.processRequest = function(request,onSuccess,onError){
	
	var rc = new RequestContext(request);
	logger.info(rc.getTransactionId() + " " + request.method+": "+request.url,'green');
	try{
		var matchedEntry = reqResolver.resolve(request);
		logger.debug(rc.getTransactionId() + " after resolving the request : " + rc.howLong() + " ms");
		rc.resolved = matchedEntry;

		if(!matchedEntry || matchedEntry === null){
			logger.debug(JSON.stringify(rc, null, "\t"));
			logger.error(rc.getTransactionId() + " Response served with Status Code 404 ");
			return onError("",{ status : 404});
		}else{
			var options = {};
			logger.detailInfo(rc.getTransactionId() + " Matching Config: " + JSON.stringify(rc.resolved,null,4));
			options.latency = calculateLatency(matchedEntry.response.latency);
			options.parser = matchedEntry.response.parser;
			if(matchedEntry.response.proxy){
				logger.info("fetching response from " + matchedEntry.response.proxy);
				options.proxy = true;
				onSuccess(matchedEntry.response.proxy,options);
			}else{
				//Set Headers
				options.headers = matchedEntry.response.headers;
				options.status = matchedEntry.response.status;
				
				var data = "";

				//Read and Build Response body
				if(matchedEntry.response.body){
					data = matchedEntry.response.body;
					logger.debug(rc.getTransactionId() + " before processing data");
					data = handleDynamicResponseBody(data,rc);
					logger.debug(rc.getTransactionId() + " after processing response body : " + rc.howLong() + " ms");
				}else if(matchedEntry.response.file || matchedEntry.response.files){
					var dataFile = resFileResolver.getFileName(matchedEntry);
					
					if(dataFile === undefined) throw Error("file name couldn't be resolved");

					if(typeof dataFile  === 'object'){
						options.status =  dataFile.status;
						dataFile = dataFile.name;
					}
					
					logger.info('Reading from file: ' + dataFile);
					if(matchedEntry.response.sendasfile){
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
				var msgStr = rc.getTransactionId() + " Response processed in " + ((new Date()) - rc.startTime) + " ms with Status Code " + options.status;
				options.status === 200 ? logger.info(msgStr,'green') : logger.error(msgStr) ;
			}
		}
	}catch(e){
		logger.error(e);
		onError("",{ status : 500},e);
	}
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