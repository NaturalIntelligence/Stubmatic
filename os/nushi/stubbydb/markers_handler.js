var markers_func = require('./markers.js');
var util = require('./util/util');

exports.handle = function(data){
	var regx = "\\{\\{([^\\}]+)\\}\\}";
	var matches = util.getAllMatches(data,regx);

	for(var func in markers_func){
		var regx = "^" + markers_func[func].exp + "$";
		matches.forEach(function(marker){
			var result = util.getMatches(marker[1],regx);
			if(result){
				var value = markers_func[func].action(result);
				data = data.replace('{{' + marker[1] + '}}',value);
			}
		});
	}
	return data;
}