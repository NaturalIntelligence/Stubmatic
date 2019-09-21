// @ts-check
const YAML = require('yamljs');
const color = require('../util/colors').color;
const logger = require('../log');
const deepAssign = require('deep-assign');

var defaultConfig = {
    request : {
        method : 'GET'
    },
    response : {
        status : 200,
        latency : 0,
        strategy: 'first-found'
    }
};

var proxyMapping = {
    request : {
        url: "/.*",
        method : '*'
    },
    response : {
        status : 200,
        latency : 0,
        strategy: 'first-found'
    }
}

module.exports = class MappingsBuilder {
    constructor(options){
        this.options = options;
        this.list = [];
        this.reload();
    }

    reload (){
        this.list = []; //reset
        if( this.options.redirectTo ){
            proxyMapping.response.proxy = this.options.redirectTo;
            this.list = [ proxyMapping ];
        }else{
            this.list = buildMappings(this.options);
            return this.list;
        }
    }

    //TODO
    //add (){}
    //delete() {}
    //search() {}
    //update() {}
}

function buildMappings(config){
    var fileLevelMappings;
    var allMappings = [];
    //defaultConfig = config.mappings.default || defaultConfig;
    defaultConfig = deepAssign({},defaultConfig,config.mappings.default);
    
    for(var fileName in config.mappings.files){
        var req_mapping = config.mappings.files[fileName];
        try{
            fileLevelMappings = YAML.parseFile(req_mapping);
            if(!fileLevelMappings || fileLevelMappings.length === 0){
                logger.info(req_mapping + " is an empty file.");
            }else{
                logger.info("Loading "+ fileLevelMappings.length +" mappings from " + req_mapping);

                for(var i=0;i<fileLevelMappings.length;i++){
                    fileLevelMappings[i] = convertToFullNotationIfShort(fileLevelMappings[i]);
                    //if parser is short noted
                    if(fileLevelMappings[i].response && fileLevelMappings[i].response.parser && typeof fileLevelMappings[i].response.parser === "string"){
                        fileLevelMappings[i].response.parser = {
                            type : fileLevelMappings[i].response.parser
                        };
                    }
                    //response
                    var resp = fileLevelMappings[i].response;

                    setDefaultIfNotExist("status",       resp,defaultConfig.response)
                    setDefaultIfNotExist("latency",     resp,defaultConfig.response)
                    setDefaultIfNotExist("headers",    resp,defaultConfig.response)
                    setDefaultIfNotExist("sendasfile", resp,defaultConfig.response)

                    if(!resp.strategy && resp.files){
                        resp.strategy = defaultConfig.response.strategy;
                    }

                    //request
                    var req = fileLevelMappings[i].request;

                    setDefaultIfNotExist("method",      req,defaultConfig.request)
                    setDefaultIfNotExist("headers",     req,defaultConfig.request)
                    setDefaultIfNotExist("query",         req,defaultConfig.request)

                }

                allMappings = allMappings.concat(fileLevelMappings);
            }
        }catch(e){
            logger.info(color("Problem in loading " + req_mapping, 'red'));
            logger.info("Check for syntax error and indentation.");
        }
    }
    return allMappings;
};

var httpMethods = ['GET','PUT','POST','HEAD','DELETE','OPTIONS','PATCH','TRACE'];
var shortNotationReqProp = ['post','query'];
var shortNotationRespProp = ['file','files','status','latency'];
/**
Converts a short notation to full notation mapping
**/
function convertToFullNotationIfShort(mapping){
    if(mapping.request){
        return mapping;
    }else{
        var fullNotation ={};
        fullNotation.request = {};
        fullNotation.response = {};

        for (var i = 0; i < httpMethods.length; i++) {
            var method = httpMethods[i];
            if(mapping[method]){
                fullNotation.request.method = method;
                fullNotation.request.url = mapping[method];
            }
        }

        shortNotationReqProp.forEach( prop => {
            if(mapping[prop]){
                fullNotation.request[prop] = mapping[prop];
            }    
        });
        
        shortNotationRespProp.forEach( prop => {
            if(mapping[prop]){
                fullNotation.response[prop] = mapping[prop];
            }    
        });

        if(mapping.response && typeof mapping.response === 'string'){
            fullNotation.response.body = mapping.response;
        }
        
        return fullNotation;
    }
}

function setDefaultIfNotExist(key,left,right){
    if(left[key] === undefined && right[key] !== undefined){
        left[key] = right[key];
    }
}
