var fs = require('fs');

exports.readFromFile = function(rc,fileName,callback){
	return fs.readFileSync(fileName, {encoding: 'utf-8'});
}

exports.isExist = function(path){
	try{
		fs.accessSync(path, fs.F_OK);
		return true;
	}catch(e){
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