var markers = require('./markers.js');
var util = require('./util/util');

exports.handle = function(data){
	var regx = "\\{\\{([^\\}]+)\\}\\}";
	var matches = util.getAllMatches(data,regx);

	var map = [];
	matches.forEach(function(match){
		map[match[1]] = "";
	});
	for(var marker_func in markers){
		markers[marker_func](map,function(marker,value){
			data = data.replace('{{' + marker + '}}',value);
		});
	}
	return data;
}