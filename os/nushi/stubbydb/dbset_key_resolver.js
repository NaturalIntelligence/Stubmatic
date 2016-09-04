var dbsets = require('./loaders/dbset_loader').dbsets;

var lastKeyIndex = [];

exports.resolveKey = function (config){
	if(config.key){
		var row = dbsets[config.db].get(config.key);
		if(!row){//key not found
			if(config.err == 'skip'){
				return new Error('skip');
			}else if(config.err && config.err.file){
				return new Error();
			}else{
				return ''; //let it fail on further level
			}
		}else{
			return config.key;
		}
	}else{//strategy
		if(config.strategy == 'random'){
			var len = dbsets[config.db].count();
			var i = Math.floor((Math.random() * len) + 1) - 1;
			return dbsets[config.db].getHashes()[i];
		}/*else if(config.strategy == 'round-robin'){
			var len = dbsets[config.db].size();
			var lastIndex = lastKeyIndex[config.db];
			if(lastIndex != undefined){
				lastKeyIndex[config.db] = lastIndex == len - 1 ? 0 : lastIndex+1;
			}else{
				lastKeyIndex[config.db] = 0;
			}
			return dbsets[config.db].getHashes()[lastKeyIndex[config.db]];
		}*/
	}
}