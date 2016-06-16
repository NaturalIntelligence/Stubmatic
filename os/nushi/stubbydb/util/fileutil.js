var fs = require('fs');
var logger = require('../log');

exports.readFromFile = function(fileName,callback,responseCode){
	fs.readFile(fileName, {encoding: 'utf-8'}, function(err,data){
	    if (!err){
	    	logger.info("Reading from " + fileName);
	    	callback(data,responseCode);
	    }else{
	        logger.info(fileName + " not found on disk");
	        callback("",responseCode,'err');
	    }
	});
}

exports.isExist = function(path){
	try{
		fs.accessSync(path, fs.F_OK);
		return true;
	}catch(e){
		//logger.error(e);
		return false;
	}
}

/* Empty list if no file or directory not exist or access issues*/
exports.ls = function(dirpath){
	if(exports.isExist(dirpath)){
		return fs.readdirSync(dirpath);
	}
	return [];
}