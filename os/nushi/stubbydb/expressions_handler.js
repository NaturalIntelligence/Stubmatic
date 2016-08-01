var util = require('./util/util');
var functions_func = require('./functions');
var function_regx = '([a-zA-Z0-9_]+)\\((.*)\\)';
var expressions_regx = "\\{\\{([^\\}]+)\\}\\}";


exports.handle = function(data){
	
	var expressions = util.getAllMatches(data,expressions_regx);

	expressions.forEach(function(expression){
		if(isFunction(expression[1])){
			var matches = util.getMatches(expression[1],function_regx);
			var functionName = matches[1];
			var parameters = matches[2].split(/,(?!(?:[^"\']))/);
			for (index = 0; index < parameters.length; index++) {
			    var value = evaluateMarker(parameters[index]);
			    if(value){
					parameters[index] = eval(value);
				}else{
					parameters[index] = eval(parameters[index]);
				}
			}
			var result = functions_func[functionName].apply(functionName,parameters);
			if(result){
				data = data.replace('{{' + expression[1] + '}}',result);
			}
		}else{
			var value = evaluateMarker(expression[1]);
			if(value){
				data = data.replace('{{' + expression[1] + '}}',value);
			}
		}
	});
	
	return data;
}

var markers_func = require('./markers.js');

var evaluateMarker = function(expression){
	if(expression.startsWith('"') || isNumeric(expression)){ return;}
	for(var func in markers_func){
		var regx = "^" + markers_func[func].exp + "$";
		var result = util.getMatches(expression,regx);
		if(result){
			return markers_func[func].evaluate(result);
		}
	}
}

var isFunction = function(exp){
	return exp.indexOf('(') !== -1 ? true : false;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}