//// @ts-check
const isBinaryFileSync = require("isbinaryfile").isBinaryFileSync;
var MappingsBuilder = require('./loaders/MappingsBuilder');
var DataTablesLoader = require('./loaders/DataTablesLoader');
var RequestResolver = require('./RequestResolver');

var util = require('./util/util');
var fs = require('fs');

var RequestContext = require('./RequestContext');
var logger = require('./log');
var expEngine = require('./expressions/engine')
var FileStrategyHandler = require('./FileStrategyHandler');
const ParserFactory = require("./responseParsers/parserFactory");

const resolveIncludeFileExpression = require('./expressions/includeFileExpression')
//const resolveDataTableExpression = require('./expressions/dataTableExpression')
const resolveParsedRequestExpression = require('./expressions/parsedRequestExpression')
const ApplicationError = require('./ApplicationError')

module.exports = class  RequestProcessor {
    constructor(config){
        this.config = config;
        this.mappings = new MappingsBuilder(config);
        this.requestResolver = new RequestResolver();
        this.dataTablesLoader = new DataTablesLoader(config["datatables"]);

        this.store = {
            dataTables: this.dataTablesLoader.tables,
            mappings: this.mappings.list
        }

        this.resFileResolver = new FileStrategyHandler(config.stubs || global.basePath);
        this.parserFactory = new ParserFactory(config);
    }

    resolve(req){
        return this.requestResolver.parse(req, this.mappings.list, this.dataTablesLoader.tables)
    }
    
    /**
    1) Find matching mapping
    2) Resolve response file/body
    3) Process response data (resolve expressions and request captured part)
    **/
    process(request, response, onSuccess, onError){
        
        var rc = new RequestContext(request);
        logger.info(rc.getTransactionId() + " " + request.method+": "+request.url,'green');

        try{
            //check against all the mappings
            var matchingEntry = this.resolve(request);
            rc.resolved = matchingEntry;
            logger.debug( `${rc.getTransactionId()} after resolving the request : ${rc.howLong()} ms`);

            const options = {};
            if(!matchingEntry || matchingEntry === null){
                logger.debug(rc.getTransactionId() + " No matching mapping is found");
                matchingEntry = this.mappings.WhenMappingNotFound
                //logger.debug(JSON.stringify(rc, null, "\t"));
                //logger.error(rc.getTransactionId() + " Response served with Status Code 404 ");
                //return onError("",{ status : 404});
            }else{
                logger.detailInfo(rc.getTransactionId() + " Matching Config: " + JSON.stringify(rc.resolved,null,4));
            }
        
            options.latency = calculateLatency(matchingEntry.response.latency);
            options.parser = matchingEntry.response.parser;
            options.recordAndPlay = matchingEntry.response.recordAndPlay;
            
            if(matchingEntry.response.from){
                logger.info("fetching response from " + matchingEntry.response.from);
                options.from = true;
                logger.debug("RequestContext: " + JSON.stringify(rc, null, "\t"));
                onSuccess( matchingEntry.response.from, options );
            }else{
                //Set Headers
                options.headers = matchingEntry.response.headers;
                options.status = matchingEntry.response.status;
                
                var data = "";

                //Read and Build Response body
                if(matchingEntry.response.body){
                    data = matchingEntry.response.body;
                    logger.debug(rc.getTransactionId() + " before processing data");
                    data = this.handleDynamicResponseBody(data,rc);
                    logger.debug(rc.getTransactionId() + " after processing response body : " + rc.howLong() + " ms");
                }else if(matchingEntry.response.file || matchingEntry.response.files){
                    var dataFile = this.resFileResolver.getFileName(matchingEntry);
                    
                    if(dataFile === undefined) throw new ApplicationError("file name couldn't be resolved", response);

                    if(typeof dataFile  === 'object'){
                        options.status =  dataFile.status;
                        options.latency =  dataFile.latency || options.latency;
                        dataFile = dataFile.name;
                    }
                    
                    logger.info('Reading from file: ' + dataFile);
                    if(isBinaryFileSync(dataFile) || matchingEntry.response.skipProcessing){
                        data = dataFile;
                        options.skipProcessing = true;
                    }else{
                        data = fs.readFileSync(dataFile, {encoding: 'utf-8'});
                            logger.debug(rc.getTransactionId() + " after reading from file : " + rc.howLong() + " ms");
                        data = this.handleDynamicResponseBody(data,rc);
                            logger.debug(rc.getTransactionId() + " after processing response body File : " + rc.howLong() + " ms");
                    }
                }

                logger.debug("RequestContext: " + JSON.stringify(rc, null, "\t"));

                if(options.parser && options.parser.type){
                    const parser = this.parserFactory.getParser(options.parser.type, options.parser.options);
                    data = parser.parse(data.toString());
                }

                onSuccess(data, options);
                var msgStr = rc.getTransactionId() + " Response processed in " + ((new Date()) - rc.startTime) + " ms with Status Code " + options.status;
                options.status === 200 ? logger.info(msgStr,'green') : logger.error(msgStr) ;
            }
        }catch(e){
            logger.error(e);
            onError("",{ status : 500},e);
        }
    }

    handleDynamicResponseBody(data,rc){
        const requestMatches = rc.resolved.request.matches;
        //1. include files
        data = resolveIncludeFileExpression(data, this.config.dumps, this.store, requestMatches);
        //2. replace DbSet Place Holders
        // data = resolveDataTableExpression(data,rc.resolved.dbset, {
        //     tables: this.dataTablesLoader.tables,
        //     parsedRequest: rc.resolved.request.matches
        // });
        //3. replace request matches
        data = resolveParsedRequestExpression(data, requestMatches);
        //4. replace markers
        data = expEngine.process(data,expEngine.fetch(data),rc, this.store);
    
        return data;
    }
}





function calculateLatency(latency){
	if(Array.isArray(latency)){
		return util.getRandomInt(latency[0],latency[1])
	}
	return latency;
}
