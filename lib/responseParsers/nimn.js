const Nimn = require("nimnjs");
const fs = require("fs");
const path = require("path");
const nimnDateParser = require("nimn-date-parser");

module.exports = class NimnParser{
    constructor(repoPath, options){
        this.repoPath = repoPath
        const schemaPath = path.join(this.repoPath,options.schema);
        const schemaStr = fs.readFileSync(schemaPath,{encoding: 'utf-8'});
        this.schema = Nimn.buildSchema( JSON.parse(schemaStr) );
    }

    parse(jsonStr){
        return Nimn.stringify(this.schema, JSON.parse(jsonStr) );
    }
}
