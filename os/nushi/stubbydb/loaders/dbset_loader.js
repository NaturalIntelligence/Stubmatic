var HashTable = require('hashtable');
var fs = require('fs'),
	path = require('path');
var lineReader = require('line-reader');
var deasync = require('deasync');

var dirPath = require("./../configbuilder").getConfig().dbsets;
var dbsets = [];

if(dirPath){
    fs.readdir(dirPath, function (err, files) {
        if (err) {
            throw new Error(err);
        }
        files.forEach(function (name) {
            console.log("Loading DB from " + name);
    		var hashtable = new HashTable();
            var filePath = path.join(dirPath, name);
            var stat = fs.statSync(filePath);
            var EOF = false;
            if (stat.isFile()) {
                var linecount = 0;
                var headers;
                lineReader.eachLine(filePath, function(line, last) {
                	var columns = splitAndTrim(line);
                	if(linecount == 0){
                		headers= columns;
                	}else{
                		var row = {};
                		for(var i in headers){
                			row[headers[i]]=columns[i];
                		}
    					hashtable.put(columns[0], row);
                	}
    			  	linecount++;
    				if(last){
    					EOF = true;
    				}
    			});
    			
            }
            deasync.loopWhile(function(){return !EOF;});
            dbsets[name] = hashtable;
        });
    });
}

exports.dbsets = dbsets;

function splitAndTrim(line){
	var columns = line.split("|");
	for(var i in columns){
		columns[i] = columns[i].trim();
	}
	return columns;
}