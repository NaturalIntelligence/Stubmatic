var fs = require('fs');
var path = require('path');

exports.isExist = function(path){
	try{
		fs.accessSync(path, fs.F_OK);
		return true;
	}catch(e){
		return false;
	}
}

/* Empty list if no file or directory not exist or access issues*/
exports.ls = function(dirpath, ext){
	if(exports.isExist(dirpath)){
		const fileList = fs.readdirSync(dirpath);
		if(ext){
			const filteredFileList = [];
			for(var i=0;i<fileList.length;i++){
				if( fileList[i].endsWith(ext) )  filteredFileList.push( path.join(dirpath, fileList[i]) );
			}
			return filteredFileList;
		}else{
			return fileList;
		}
	}
	return [];
}
