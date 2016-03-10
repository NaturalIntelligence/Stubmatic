var HashTable = require('hashtable');
var preutil = require('./preutil');
var fs = require('fs'),
	path = require('path');
var lineReader = require('line-reader');
var deasync = require('deasync');

var dirPath = preutil.getConfigFor('dbsets');
var datasets = [];

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
        datasets[name] = hashtable;
    });
});


exports.datasets = datasets;

function splitAndTrim(line){
	var columns = line.split("|");
	for(var i in columns){
		columns[i] = columns[i].trim();
	}
	return columns;
}