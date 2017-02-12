var YAML = require('yamljs');
var color = require('./../util/colors').color;
var logger = require('./../log');

var resp_prop1 = ['status','latency'];
var resp_prop2 = ['headers','contentType'];
var req_prop = ['headers','query'];

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
    defaultConfig = config.mappings.default || defaultConfig;
    
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
                    for (var j = 0; j < resp_prop1.length; j++) {
                        if(!resp[resp_prop1[j]]){
                            resp[resp_prop1[j]] = defaultConfig.response[resp_prop1[j]] ;
                        }
                    }

                    if(!resp.strategy && resp.files){
                        resp.strategy = defaultConfig.response.strategy;
                    }

                    for (j = 0; j < resp_prop2.length; j++) {
                        if(!resp[resp_prop2[j]] && defaultConfig.response[resp_prop2[j]]){
                            resp[resp_prop2[j]] = defaultConfig.response[resp_prop2[j]] ;
                        }
                    }
                    //request
                    var req = mappings[i].request;
                    if(!req.method){
                        req.method = defaultConfig.request.method;
                    }

                    for (j = 0; j < req_prop.length; j++) {
                        var prop = req_prop[j];
                        if(!req[prop] && defaultConfig.request[prop]){
                            req[prop] = defaultConfig.request[prop] ;
                        }
                    }
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
var shortNotationReqProp = ['body','bodyText'];
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

exports.getMappings = function() {
    return allMappings;
};