const Nimn = require("nimnjs");
const fs = require("fs");
const path = require("path");
const nimnDateParser = require("nimn-date-parser");
const configBuilder = require("../configbuilder");

nimn.prototype.parse = function(jsonStr){
    return this.nimnInstance.encode(JSON.parse(jsonStr));
}

function nimn(options){
    this.nimnInstance = new Nimn();

    if(options.parseDate){
        this.nimnInstance.addDataHandler("date",dt =>nimnDateParser.parse(dt,true,true,true) );
    }else{
        this.nimnInstance.addDataHandler("date");
    }

    if(options.parseBoolean !== undefined && options.parseBoolean === false){
        this.nimnInstance.addDataHandler("boolean");
    }
    const schemaPath = path.join(configBuilder.getConfig().repoPath,options.schema);
    const schemaStr = fs.readFileSync(schemaPath,{encoding: 'utf-8'});
    this.nimnInstance.addSchema(JSON.parse(schemaStr));
}

module.exports = nimn;