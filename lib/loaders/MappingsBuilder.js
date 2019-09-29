// @ts-check
const YAML = require('yamljs');
const color = require('../util/colors').color;
const logger = require('../log');
const path = require('path');
const fileutil = require('./../util/fileutil');
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

var httpMethods = ['GET','PUT','POST','HEAD','DELETE','OPTIONS','PATCH','TRACE'];
var shortNotationReqProp = ['post','query'];
var shortNotationRespProp = ['file','files','status','latency'];

module.exports = class MappingsBuilder {
    constructor(options){
        this.options = options;
        this.list = [];
        this.WhenMappingNotFound = {
            response: {
                status: 404
            }
        }
        this.reload();
    }

    reload (){
        this.list = []; //reset
        if( this.options.from ){
            this.WhenMappingNotFound.response.from = this.options.from;
            this.updateMappingOptions({}, this.WhenMappingNotFound.response)
        }else{
            this.list = this.buildMappings();
            return this.list;
        }
    }

    updateMappingOptions(req, resp){
        //resp
        setDefaultIfNotExist("status",       resp,defaultConfig.response)
        setDefaultIfNotExist("latency",     resp,defaultConfig.response)
        setDefaultIfNotExist("headers",    resp,defaultConfig.response)
        setDefaultIfNotExist("sendasfile", resp,defaultConfig.response)
    
        if(!resp.strategy && resp.files){
            resp.strategy = defaultConfig.response.strategy;
        }
        if(resp.from){
            if(resp.record === true) resp.recordPath = this.options.stubs;
            else if(resp.record) {
                if( fileutil.isExist(resp.record) ) resp.recordPath = resp.record;
                else{
                    resp.recordPath = path.join(this.options.stubs, resp.record);
                    if( ! fileutil.isExist(resp.recordPath) ) throw Error("Recording path is invalid or doesnt exist")
                }
            }
            else resp.recordPath = resp.record;
        }
    
        //request
    
        setDefaultIfNotExist("method",      req,defaultConfig.request)
        setDefaultIfNotExist("headers",     req,defaultConfig.request)
        setDefaultIfNotExist("query",         req,defaultConfig.request)
        
    }

    buildMappings(){
        var fileLevelMappings;
        var allMappings = [];
        //defaultConfig = config.mappings.default || defaultConfig;
        defaultConfig = deepAssign({},defaultConfig, this.options.mappings.default);
        
        for(var fileName in this.options.mappings.files){
            var req_mapping = this.options.mappings.files[fileName];
            try{
                fileLevelMappings = YAML.parseFile(req_mapping);
                if(!fileLevelMappings || fileLevelMappings.length === 0){
                    logger.info(req_mapping + " is an empty file.");
                }else{
                    logger.info("Loading "+ fileLevelMappings.length +" mappings from " + req_mapping);
    
                    for(var i=0;i<fileLevelMappings.length;i++){
                        if(fileLevelMappings[i].WhenMappingNotFound){
                            this.WhenMappingNotFound = fileLevelMappings[i].WhenMappingNotFound;
                            this.updateMappingOptions({}, this.WhenMappingNotFound.response)
                        }else{
                            fileLevelMappings[i] = convertToFullNotationIfShort(fileLevelMappings[i]);
                            //if parser is short noted
                            //TODO: move it to single mapping
                            if(fileLevelMappings[i].response && fileLevelMappings[i].response.parser && typeof fileLevelMappings[i].response.parser === "string"){
                                fileLevelMappings[i].response.parser = {
                                    type : fileLevelMappings[i].response.parser
                                };
                            }
                            this.updateMappingOptions(fileLevelMappings[i].request, fileLevelMappings[i].response)
                        }
                    }
    
                    allMappings = allMappings.concat(fileLevelMappings);
                }
            }catch(e){
                logger.info(color("Problem in loading " + req_mapping, 'red'));
                logger.info("Check for syntax error and indentation.");
            }
        }
        return allMappings;
    }
    //TODO
    add ( newMapping ){
        this.list = this.list.concat (newMapping);
        console.log (JSON.stringify(this.list, null,4));
    }
    //delete() {}
    //search() {}
    //update() {}
}


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
