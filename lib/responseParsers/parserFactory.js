const msgpack = require("./msgpack")
const nimn = require("./nimn")

exports.getParser = function(type, options){
    switch(type){
        case "jsonToNimn":
            return new nimn(options);
        case "jsonToMsgpack":
            return msgpack;
        default:
            return {
                parse: a=>a
            }
    }
}