const Nimn = require("nimnjs");
const fs = require("fs");
const path = require("path");
const nimnDateParser = require("nimn-date-parser");
const configBuilder = require("../configbuilder");

nimn.prototype.parse = function(jsonStr){
    return Nimn.stringify(this.schema, JSON.parse(jsonStr) );
}

function nimn(options){
    /* if(options.parseDate){
        this.nimnInstance.addDataHandler("date",dt =>nimnDateParser.parse(dt,true,true,true) );
    }else{
        this.nimnInstance.addDataHandler("date");
    }

    if(options.parseBoolean !== undefined && options.parseBoolean === false){
        this.nimnInstance.addDataHandler("boolean");
    } */
    const schemaPath = path.join(configBuilder.getConfig().repoPath,options.schema);
    const schemaStr = fs.readFileSync(schemaPath,{encoding: 'utf-8'});
    this.schema = Nimn.buildSchema( JSON.parse(schemaStr) );
}

module.exports = nimn;