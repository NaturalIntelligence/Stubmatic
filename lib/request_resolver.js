var util = require('./util/util');
var logger = require('./log');
var dbsetsLoader = require('./loaders/dbset_loader');
var mappingsLoader = require('./loaders/mappings_loader');

exports.resolve = function (http_request){
	var mappings = mappingsLoader.getMappings();
	for(var i=0;i<mappings.length;i++){
        var entry = util.clone(mappings[i]);
        var matched = matchAndCapture(entry.request, http_request);
        if(matched){//if nothing matches in current mapping, check for other matching
        	entry.request.matches = matched;
        	entry.index = i;

        	//resolve dbset entries
        	if(entry.dbset){
				entry.dbset.db = util.applyMatches(entry.dbset.db,matched);
				if(entry.dbset.key){
					entry.dbset.key = util.applyMatches(entry.dbset.key,matched);
				}
				var result = resolveDBSetKey(entry.dbset);
				if(result){
					entry.dbset.key = result;
				}else{
					continue;
				}
			}
        	return entry;
		}
    }
    return null;
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
		var matches = util.getAllMatches(http_request.post, mapped_request.post);
		var match = sliceExtraProperties(matches);
		if(match.length > 0)			matched['post'] = match;
		else			return;
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
		return;
	}
	for(var key in mapped_request[param_name]){
		//if(!http_request[param_name][key] && mapped_request[param_name][key] !== '!'){

		var value = http_request[param_name][key];
		if(!value)		return;

		var matches = util.getMatches( value, '^'+mapped_request[param_name][key]+'$' );
		
		if(!matches) return;
		if(matches && matches.length > 1){
			matches = matches.slice(1);
			clips = clips.concat(matches);
		}
	}
	return clips;
}

/**
Slice extra properties away
**/
function sliceExtraProperties(matches){
	var match = [];
	for (var i = 0; i < matches.length; i++) {
		match = match.concat(matches[i].slice(0,matches[i].length - 2));
	}
	return match;
}

//var lastKeyIndex = [];

var resolveDBSetKey = function (config){
	var dbsets = dbsetsLoader.getDBsets();

	if(config.key){
		var row = dbsets[config.db].get(config.key);
		if(row){
			return config.key;
		}else if(dbsets[config.db].get('*')){
			return '*';
		}
	}else{//strategy
		if(config.strategy === 'random'){
			var len = dbsets[config.db].count();
			var i = Math.floor((Math.random() * len) + 1) - 1;
			return dbsets[config.db].getHashes()[i];
		}/*else if(config.strategy === 'round-robin'){
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