var dbsets = require('./loaders/dbset_loader').getDBsets();
var util = require('./util/util');
var logger = require('./log');

//replace DbSet Place Holders

exports.handle = function(data, dbset){
	if(dbset){
		var regx = "##([^#]+)##";
		var matches = util.getAllMatches(data,regx);

		for(var i in matches){
			var match= matches[i];
			var column = match[1];
			var row = dbsets[dbset.db].get(dbset.key);
			if(row){
				data = data.replace(match[0],row.value[column]);	
			}else{
				logger.detailInfo('Key: ' + dbset.key + ' not found in ' + dbset.db);
				return new Error('Key: ' + dbset.key + ' not found in ' + dbset.db);
			}
		}
	}
	return data;
}


