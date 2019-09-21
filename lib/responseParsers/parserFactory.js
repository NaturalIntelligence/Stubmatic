const msgpack = require("./msgpack")
const Nimn = require("./nimn")

module.exports = class ParserFactory{
    constructor(config){
        this.config = config;
    }

    getParser(type, options){
        switch(type){
            case "jsonToNimn":
                return new Nimn(this.config.repoPath, options);
            case "jsonToMsgpack":
                return msgpack;
            default:
                return {
                    parse: a=>a
                }
        }
    }
}