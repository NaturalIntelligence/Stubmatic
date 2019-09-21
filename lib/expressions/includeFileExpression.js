// @ts-check
var fs = require('fs');
var util = require('./../util/util');
var path = require('path');

//TODO: resolve daa-tables entries
/**
 * Include file contents from the given file directory
 * 
 * Eg: {{include( "fileName", 'fileName2', url[1], #dataTableColumn, "path/subpath/#dataTableColumn") }}
 * @param {string} data 
 * @param {string} dumpsdir root location off all the files
 * @param {object} store
 */
module.exports = function (data, dumpsdir, store, requestMatches){
	//var regx = "\\[\\[([^\\]]+)\\]\\]";
	var regx = "{{\\s*include\\(([^}]*)\\)\\s*}}";
	var matches = util.getAllMatches(data,regx);
	
	for(var i in matches){
		var match= matches[i];
		if(match[1].trim() === ''){
			//skip the error
		}else{
			const files = match[1].split(",");
			let contentToreplace = "";

			for (var index in files) {
				let fileName = files[index].trim();
				if(fileName === "") continue;
				if(fileName[0] === "'" || fileName[0] === '"') {
					fileName = eval(fileName);
					fileName = resolveDataTableExp(fileName, store);
				}else{
					fileName = resolveRequestParamExp(fileName, requestMatches);
				}
				var filePath= path.join(dumpsdir , fileName);
				var readFileFlag = false;
				try{
					contentToreplace += fs.readFileSync(filePath, {encoding: 'utf-8'});
				}catch(err){
					//skip the error
				}
			}
			data = data.replace(match[0],contentToreplace);
		}
		
	}
	return data;
}

/**
 * 
 * @param {string} fileName 
 * @param {object} matches 
 */
function resolveRequestParamExp(fileName, matches){
	const regx = "([a-zA-Z]+)\\[\\s([0-9]+)\\s*\\]";
	const reqParamsPart = util.getMatches(fileName,regx);
	const paramName = reqParamsPart[1];
	const index =  reqParamsPart[2];
	return matches[paramName][index];
}

/**
 * 
 * @param {string} fileName 
 * @param {object} store 
 */
function resolveDataTableExp(fileName, store){
	const regx = "#([a-zA-Z0-9_]+)";
	const matches = util.getMatches(fileName,regx);
	if(matches){
		const columnName = matches[1];
		const matchingDataTable = store.resolvedRequest["data-table"];
		return  fileName.replace("#columnName", store.dataTables[matchingDataTable.name].get(matchingDataTable.key).value[columnName])
	}else{
		return fileName;
	}
}