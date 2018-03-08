const YAML = require('yamljs');
const color = require('./../util/colors').color;
const logger = require('./../log');
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

var allMappings = [];
exports.buildMappings = function(config){
    var mappings;
    allMappings = [];
    //defaultConfig = config.mappings.default || defaultConfig;
    defaultConfig = deepAssign({},defaultConfig,config.mappings.default);
    
    for(var fileName in config.mappings.files){
        var req_mapping = config.mappings.files[fileName];
        try{
            mappings = YAML.parseFile(req_mapping);
            if(!mappings || mappings.length === 0){
                logger.info(req_mapping + " is an empty file.");
            }else{
                logger.info("Loading "+ mappings.length +" mappings from " + req_mapping);

                for(var i=0;i<mappings.length;i++){
                    mappings[i] = convertToFullNotationIfShort(mappings[i]);
                    
                    //response
                    var resp = mappings[i].response;

                    setDefaultIfNotExist("status",resp,defaultConfig.response)
                    setDefaultIfNotExist("latency",resp,defaultConfig.response)
                    setDefaultIfNotExist("headers",resp,defaultConfig.response)
                    setDefaultIfNotExist("sendasfile",resp,defaultConfig.response)

                    if(!resp.strategy && resp.files){
                        resp.strategy = defaultConfig.response.strategy;
                    }

                    //request
                    var req = mappings[i].request;

                    setDefaultIfNotExist("method",req,defaultConfig.request)
                    setDefaultIfNotExist("headers",req,defaultConfig.request)
                    setDefaultIfNotExist("query",req,defaultConfig.request)

                }

                allMappings = allMappings.concat(mappings);
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
Converts short notation to full notation mapping
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

exports.getMappings = function() {
    return allMappings;
};