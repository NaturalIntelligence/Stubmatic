var util = require('./util/util');
var mappings = require('./loaders/mappings_loader').getMappings();
var logger = require('./log');

exports.resolve = function (http_request){
	for(var i=0;i<mappings.length;i++){
        var entry = util.clone(mappings[i]);
        var matched = matchAndCapture(entry.request, http_request);
        if(matched){//if nothing matches in current mapping, check for other matching
        	entry.request.matches = matched;
        	entry.index = i;

        	//resolve dbset entries
        	if(entry.dbset){
				entry.dbset.db = exports.applyMatches(entry.dbset.db,matched);
				if(entry.dbset.key){
					entry.dbset.key = exports.applyMatches(entry.dbset.key,matched);
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


function matchAndCapture(mapped_request, http_request){
	var matched = {};

	if(mapped_request.method != http_request.method){
		return;
	}

	if(mapped_request.url){
		var match = util.getMatches(http_request.url,'^'+mapped_request.url+'$');
		if(match){
			matched['url'] = match;
		}else{
			return;
		}
	}

	if(mapped_request.post){
		var matches = util.getAllMatches(http_request.post,mapped_request.post);
		
		var match = [];
		for(var i in matches){
			match = match.concat(matches[i].slice(0,matches[i].length - 2));
		}

		if(match.length > 0){
			matched['post'] = match;
		}else{
			return;
		}
	}	

	if(mapped_request.headers){
		var result = matchParamters(http_request,mapped_request,"headers");
		if(result)
			matched['headers'] = result;
		else
			return;
	}

	if(mapped_request.query){
		var result = matchParamters(http_request,mapped_request,"query");
		if(result)
			matched['query'] = result;
		else
			return;
	}
	
	return matched;
}

function matchParamters(http_request,mapped_request,param_name){
	var clips = [];
	clips[0] = "N/A";
	for(var key in mapped_request[param_name]){
		var matches = util.getAllMatches(http_request[param_name][key],'^'+mapped_request[param_name][key]+'$');
		var match = [];
		for(var i in matches){
			match = match.concat(matches[i].slice(0,matches[i].length - 2));
		}
		if(match.length > 0){
			var captured = match.slice(1);
			if(captured)
				clips = clips.concat(captured);
		}else{
			return;
		}
	}
	return clips;
}

exports.applyMatches = function(data,matches){
	data = "" + data;
	for(var matching_key in matches){
		var part = matches[matching_key];
		for(var i=0;i<part.length;i++){
			rgx = new RegExp("<% "+ matching_key +"\."+ i +" %>","g");
			data = data.replace(rgx,part[i]);	
		}
	}
	return data;
}

var dbsets = require('./loaders/dbset_loader').getDBsets();

//var lastKeyIndex = [];

var resolveDBSetKey = function (config){
	if(config.key){
		var row = dbsets[config.db].get(config.key);
		if(row){
			return config.key;
		}else if(dbsets[config.db].get('*')){
			return '*';
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