var YAML = require('yamljs');
var config = require("./../configbuilder").getConfig()
var color = require('./../util/colors').color;
var logger = require('./../log');
var config_mapping = config.mappings;

var allMappings = [];

var defaultConfig = config_mapping.default;

for(var i in config_mapping.requests){
    var req_mapping = config_mapping.requests[i];
    var mappings;
    try{
        mappings = YAML.parseFile(req_mapping);
    }catch(e){
        logger.info(color("Problem in loading " + req_mapping, 'Red'))
    }

    
    if(!mappings || mappings.length == 0){
        logger.info(req_mapping + " is an empty file.");
        continue;
    }
    logger.info("Loading "+ mappings.length +" mappings from " + req_mapping);

    for(var i=0;i<mappings.length;i++){

        if(typeof mappings[i].response == 'string'){
            mappings[i].response = {
                body: mappings[i].response,
                status: 200,
                latency: 0
            }
        }

        if(typeof mappings[i].request == 'string'){
            mappings[i].request = {
                url: mappings[i].request,
                method: 'GET'
            }
        }


        if(!mappings[i].response.status){
            if(defaultConfig.response.status){
                mappings[i].response['status'] = defaultConfig.response.status;
            }else{
                mappings[i].response['status'] = 200;
            }
        }

        if(!mappings[i].response.latency){
            if(defaultConfig.response.latency){
                mappings[i].response['latency'] = defaultConfig.response.latency;
            }else{
                mappings[i].response['latency'] = 0;
            }
        }

        if(!mappings[i].response.strategy){
            if(defaultConfig.response.strategy){
                mappings[i].response['strategy'] = defaultConfig.response.strategy;
            }else if(mappings[i].response.files){
                mappings[i].response['strategy'] = 'first-found';
            }
        }

        if(!mappings[i].request.method){
            mappings[i].request['method'] = 'GET';
        }

    }

    allMappings = allMappings.concat(mappings);
}

exports.mappings = allMappings;