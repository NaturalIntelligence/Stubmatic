// @ts-check
var util = require('./util/util');
const resolveParsedRequestExpression = require('./expressions/parsedRequestExpression')

module.exports = class RequestResolver {
	parse(http_request, mappings, dataTables){
		for(var i=0;i<mappings.length;i++){
			var entry = util.clone(mappings[i]);
			var matched = matchAndCapture(entry.request, http_request);
			if(matched){//if nothing matches in current mapping, check for other matching
				entry.request.matches = matched;
				entry.index = i;
	
				//resolve dbset entries
				if(entry["data-table"]){
					entry["data-table"].name = resolveParsedRequestExpression(entry["data-table"].name, matched);
					if(entry["data-table"].key){
						entry["data-table"].key = resolveParsedRequestExpression(entry["data-table"].key, matched);
					}
					var result = resolveDBSetKey(entry["data-table"], dataTables);
					if(result){
						entry["data-table"].key = result;
					}else{
						continue;
					}
				}
				return entry;
			}
		}
		return null;
	}
}

var props = ["headers","query"];
/**
return undefined if any property of mapping doesn't match with request
**/
function matchAndCapture(mapped_request, http_request){
	var matched = {}, i=0;

	if(Array.isArray(mapped_request.method)){
		if(mapped_request.method.indexOf(http_request.method) === -1) return;
	}else if(mapped_request.method === "*"){
		//do nothing
	}else{
		if(mapped_request.method !== http_request.method)	return;
	}

	if(mapped_request.url){
		var urlmatch = util.getMatches(http_request.url,'^'+mapped_request.url+'$');
		if(urlmatch)	matched['url'] = urlmatch;
		else	return;
	}

	if(mapped_request.post){
		 const matches = util.getAllMatches(http_request.post, mapped_request.post);
		 matched['post'] = concatAllMatches(matches);
		if(! matched['post']) return;
	}
	
	for (i = 0; i < props.length; i++) {
		if(mapped_request[props[i]]){
			var result = matchParamters(http_request, mapped_request, props[i]);
			if(result)			matched[props[i]] = result;
			else			return;
		}
	}
	
	return matched;
}

function matchParamters(http_request, mapped_request, param_name){
	var clips = [];
	clips[0] = "N/A";
	if( !http_request[param_name]){
		if( mapped_request[param_name] ){
			for(var key in mapped_request[param_name]){
				if(mapped_request[param_name][key] !== '^') return;
			}
			return clips;
		}else{
			return;
		}
	}else{
		for(var key in mapped_request[param_name]){
			var value = http_request[param_name][key];
			
			if(mapped_request[param_name][key] === '^'){
				if(value) return;
			}else if(!value){
				return;
			}else{
				var matches = util.getMatches( value, '^'+mapped_request[param_name][key]+'$' );
				
				if(!matches) return;
				if(matches && matches.length > 1){
					matches = matches.slice(1);
					clips = clips.concat(matches);
				}
			}
	
		}
		return clips;
	}
}

function concatAllMatches(matches){
	var match = [];
	for (var i = 0; i < matches.length; i++) {
		match = match.concat(matches[i]);
	}
	return match;
}

//var lastKeyIndex = [];

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