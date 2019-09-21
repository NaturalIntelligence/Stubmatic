// @ts-check
var util = require('./../util/util');

/**
 * replace data tables Place Holders
 */
module.exports = function(data, mappedEntry, source){
	var regx = "{{\\s*(.*)\\s*}}";
	var expressions = util.getAllMatches(data,regx);
	var dataTableRegex = "#(([\\w]+)|(([\\w]+)(\\[\\s*([0-9]+)\\s*\\])?)(\\((.*?)\\))?\.([\\w]+))";
	for(var i in expressions){
		const exp= expressions[i];
		const matches = util.getAllMatches(exp[1],dataTableRegex);
		for(var j in matches){
			let match = matches[j];	

			let tableName = getMatchingReqParam(match[1], source.parsedRequest);
			let arg = match[6];
			let columnName = match[7];
			let primaryKeyValue = "*"; //default key
			if(arg){
				arg = arg.trim();
				if(arg === '*'){ //random
					const len = source.tables[tableName].count();
					const randomRowNum  = Math.floor((Math.random() * len) + 1) - 1;
					primaryKeyValue =  source.tables[tableName].getHashes()[ randomRowNum ];
				}else if(arg === '$'){//round-robin
					//in progress
				}else{
					primaryKeyValue = getMatchingReqParam(arg, source.parsedRequest);
				}
			}
			let row = source.tables[tableName].get( primaryKeyValue);
			if(!row) row = source.tables[tableName].get( "*");
			data = data.replace(match[0],row.value[ columnName ]);

		}
	}
	return data;
}

function getMatchingReqParam(exp, parsedRequest){
	const rgx = new RegExp("([a-z]+)\\[\\s*([0-9]+)\\s*\\]");
	const matches = util.getMatches(exp,rgx);
	if(matches){
		return parsedRequest[matches[1]][matches[2]];
	}else{
		return exp;
	}
}

var resolveDBSetKey = function (table, tables){
	if(table.key){
		var row = tables[table.name].get(table.key);
		if(row){
			return table.key;
		}else if(tables[table.name].get('*')){
			return '*';
		}
	}else{//strategy
		if(table.strategy === 'random'){
			var len = tables[table.name].count();
			var i = Math.floor((Math.random() * len) + 1) - 1;
			return tables[table.name].getHashes()[i];
		}/*else if(config.strategy === 'round-robin'){
			var len = dbsets[config.name].size();
			var lastIndex = lastKeyIndex[config.name];
			if(lastIndex != undefined){
				lastKeyIndex[config.name] = lastIndex == len - 1 ? 0 : lastIndex+1;
			}else{
				lastKeyIndex[config.name] = 0;
			}
			return dbsets[config.name].getHashes()[lastKeyIndex[config.name]];
		}*/
	}
}

