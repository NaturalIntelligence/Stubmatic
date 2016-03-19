var dbsets = require('./dbset_loader').dbsets;
var util = require('./util/util');
var log = require('./log');


exports.replaceWithDbSetPlaceHolders = function(data, dbset, key){
	var regx = "##([^#]+)##";
	var matches = util.getAllMatches(data,regx);

	for(var i in matches){
		var match= matches[i];
		var column = match[1];
		var row = dbsets[dbset].get(key);
		if(row){
			data = data.replace(match[0],row[column]);	
		}else{
			log.info('Key: ' + key + ' not found in ' + dbset);
			throw new Error('404 Key is not found');
		}
	}
	return data;
}


