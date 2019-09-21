// @ts-check
var hashes = require('hashes');
var fs = require('fs'),
    path = require('path');
var readline = require('readline');
var logger = require('../log');


module.exports = class DataTablesLoader {
    constructor(source){
        this.source = source;
        this.tables = [];
        this.reload();
    }

    reload(){
        this.tables = [];
        if(this.source){
            try{
                var files = fs.readdirSync(this.source);
                files.forEach(  (name) => {
                    logger.info("Loading Data Table  " + name);
                    var hashtable = new hashes.HashTable();
                    var filePath = path.join(this.source, name);
                    var stat = fs.statSync(filePath);
                    if (stat.isFile()) {
                        var linecount = 0;
                        var headers;
                        var rd = readline.createInterface({
                            input: fs.createReadStream(filePath)
                            /*,output: process.stdout
                            ,terminal: false*/
                        });
                        rd.on('line', function(line) {
                            var columns = splitAndTrim(line);
                            if(linecount === 0){
                                headers= columns;
                            }else{
                                var row = {};
                                for(var i in headers){
                                    row[headers[i]]=columns[i];
                                }
                                hashtable.add(columns[0], row);
                            }
                            linecount++;
                        });
                        this.tables[name] = hashtable;
                    }
                });
    
            }catch(err){
                logger.error("Can not load data tables from " + this.source + ", " + err);
                //throw new Error(err);
            }
        }
        return this.tables;
    }
}

function splitAndTrim(line){
    var columns = line.split("|");
    for(var i in columns){
        columns[i] = columns[i].trim();
    }
    return columns;
}