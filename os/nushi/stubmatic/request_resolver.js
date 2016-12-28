var util = require('./util/util');
var mappings = require('./loaders/mappings_loader').mappings;
var logger = require('./log');
var keyResolver = require('./dbset_key_resolver');


exports.resolve = function (http_request){
	for(var i=0;i<mappings.length;i++){
        var entry = util.clone(mappings[i]);
        var matched = match(entry.request, http_request);
        if(matched){
        	entry.request.matches = matched;
        	entry.index = i;

        	//resolve dbset entries
        	if(entry.dbset){
				entry.dbset.db = exports.applyMatches(entry.dbset.db,matched);
				if(entry.dbset.key){
					entry.dbset.key = exports.applyMatches(entry.dbset.key,matched);
				}
				//in case of err:err and key is not found. It sets key as ''. So It'll further error out
				var result = keyResolver.resolveKey(entry.dbset);
				if(result instanceof Error){
					if(result.message == 'skip'){
						continue;
					}else{
						entry.response.file = entry.dbset.err.file;
					}
				}else{
					entry.dbset.key = result;
				}
			}
        	return entry;
		}
    }
    return null;
}

function match(mapped_request, http_request){
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
		matched['headers'] = [];
		matched['headers'][0] = "N/A";
		for(var header in mapped_request.headers){
			var matches = util.getAllMatches(http_request.headers[header],'^'+mapped_request.headers[header]+'$');
			var match = [];
			for(var i in matches){
				match = match.concat(matches[i].slice(0,matches[i].length - 2));
			}
			if(match.length > 0){
				var captured = match.slice(1);
				if(captured)
					matched['headers'] = matched['headers'].concat(captured);
			}else{
				return;
			}
		}
	}

	if(mapped_request.query){
		matched['query'] = [];
		matched['query'][0] = "N/A";
		for(var key in mapped_request.query){
			var matches = util.getAllMatches(http_request.query[key],'^'+mapped_request.query[key]+'$');
			var match = [];
			for(var i in matches){
				match = match.concat(matches[i].slice(0,matches[i].length - 2));
			}
			if(match.length > 0){
				var captured = match.slice(1);
				if(captured)
					matched['query'] = matched['query'].concat(captured);
			}else{
				return;
			}
		}
	}
	
	return matched;
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