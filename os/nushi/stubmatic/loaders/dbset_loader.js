var hashes = require('hashes');
var fs = require('fs'),
    path = require('path');
var lineReader = require('line-reader');
var logger = require('./../log');

var configbuilder = require("./../configbuilder");
var dbsets = [];

exports.load = function(){
    var dirPath = configbuilder.getConfig().dbsets;
    dbsets = [];
    if(dirPath){
        try{
            var files = fs.readdirSync(dirPath);

            files.forEach(function (name) {
                logger.info("Loading DB from " + name);
                var hashtable = new hashes.HashTable();
                var filePath = path.join(dirPath, name);
                var stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    var linecount = 0;
                    var headers;
                    //console.log(filePath);
                    //console.log(fs.readFileSync(filePath).toString());
                    lineReader.eachLine(filePath, function(line, last) {
                        //console.log(line);
                        var columns = splitAndTrim(line);
                        if(linecount == 0){
                            headers= columns;
                        }else{
                            var row = {};
                            for(var i in headers){
                                row[headers[i]]=columns[i];
                            }
                            hashtable.add(columns[0], row);
                        }
                        linecount++;
                        if(last){
                            dbsets[name] = hashtable;
                        }
                    });
                    //console.log("loaded data: " + JSON.stringify(hashtable));
                }
            });

        }catch(err){
            logger.error("Can not load db sets from" + dirPath);
            throw new Error(err);
        }
    }
}

exports.getDBsets = function(){
    return dbsets;
}

function splitAndTrim(line){
    var columns = line.split("|");
    for(var i in columns){
        columns[i] = columns[i].trim();
    }
    return columns;
}