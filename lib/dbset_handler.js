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
			data = data.replace(match[0],row.value[column]);
		}
	}
	return data;
}


