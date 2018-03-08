const notpack = require("notepack.io");

exports.parse = function(jsonString){
    return notpack.encode(JSON.parse(jsonString));
}