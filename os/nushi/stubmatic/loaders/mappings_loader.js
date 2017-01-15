var YAML = require('yamljs');
var color = require('./../util/colors').color;
var logger = require('./../log');


var allMappings = [];

exports.load = function(){
    allMappings = [];
    var config = require("./../configbuilder").getConfig();
    var defaultConfig = config.mappings.default;
    if(!defaultConfig){
        defaultConfig = {
            request : {
                method : 'GET'
            },
            response : {
                status : 200,
                latency : 0,
                strategy: 'first-found'
            }
        }
    }

    for(var fileName in config.mappings.requests){
        var req_mapping = config.mappings.requests[fileName];
        var mappings;
        try{
            mappings = YAML.parseFile(req_mapping);
        }catch(e){
            logger.info(color("Problem in loading " + req_mapping, 'Red'))
            logger.info("Check for syntax error and indentation.")
        }

        
        if(!mappings || mappings.length == 0){
            logger.info(req_mapping + " is an empty file.");
        }else{
            logger.info("Loading "+ mappings.length +" mappings from " + req_mapping);

            for(var i=0;i<mappings.length;i++){

                mappings[i] = convertToFullNotationIfShort(mappings[i]);

                //response
                ['status','latency'].forEach(prop => {
                    if(!mappings[i].response[prop]){
                        mappings[i].response[prop] = defaultConfig.response[prop] ;
                    }
                });

                if(!mappings[i].response['strategy'] && mappings[i].response['files']){
                    mappings[i].response['strategy'] = defaultConfig.response['strategy'];
                }

                ['headers','contentType'].forEach(prop => {
                    if(!mappings[i].response[prop] && defaultConfig.response[prop]){
                        mappings[i].response[prop] = defaultConfig.response[prop];
                    }
                });

                //request
                if(!mappings[i].request['method']){
                    mappings[i].request['method'] = defaultConfig.request['method'];
                }

                ['headers','query'].forEach(prop => {
                    if(!mappings[i].request[prop] && defaultConfig.request[prop]){
                        mappings[i].request[prop] = defaultConfig.request[prop];
                    }
                });


            }

            allMappings = allMappings.concat(mappings);
        }
    }
}


exports.getMappings = function(){
    return allMappings;
}

var httpMethods = ['GET','PUT','POST','HEAD','DELETE','OPTIONS','PATCH','TRACE']

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

        httpMethods.forEach((method) => {
            if(mapping[method]){
                fullNotation.request.method = method;
                fullNotation.request.url = mapping[method];
            }
        });

        ['body','bodyText'].forEach( prop => {
            if(mapping[prop]){
                fullNotation.request[prop] = mapping[prop];
            }    
        });
        
        ['file','files','status','latency'].forEach( prop => {
            if(mapping[prop]){
                fullNotation.response[prop] = mapping[prop];
            }    
        });

        if(mapping['response'] && typeof mapping['response'] === 'string'){
            fullNotation.response['body'] = mapping['response'];
        }
        
        return fullNotation;
    }
}