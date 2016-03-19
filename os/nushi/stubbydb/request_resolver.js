var util = require('./util/util');
var mappings = require('./mappings_loader').mappings;

exports.resolve = function (http_request){
	for(var i=0;i<mappings.length;i++){
        var entry = mappings[i];
        var req_parts = match(entry.request, http_request);
        if(req_parts){
        	entry.request.matches = req_parts;
        	entry.index = i;
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

		/*var match = util.getAllMatches(http_request.url,mapped_request.url);

		var match = [];
		for(var i in matches){
			match = match.concat(matches[i].slice(0,matches[i].length - 2));
		}

		if(match.length > 0){
			matched['url'] = match;
		}else{
			return;
		}*/
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
		for(var header in mapped_request.headers){
			if(http_request.headers[header] != mapped_request.headers[header]){
				return;
			}
		}
	}
	
	return matched;
}
