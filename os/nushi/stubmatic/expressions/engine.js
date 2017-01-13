var util = require('.././util/util');
var markers = require('.././markers.js');
var functions = require('.././functions.js');

const expRegx = "\\{\\{([^\\}]+)\\}\\}";

/**
startIndex: starting position in Data
data: A string enclosed in {{.*}}
**/
var Expression = function(startIndex, data){
	this.startIndex = startIndex;
	this.data = data;
}

var FunctionExp = function(name,args){
	this.name = name;
	this.args = args;
}

/**
Fetch all the expressions from data
**/
var fetch = function(data){
	var matches = util.getAllMatches(data,expRegx);
	var expressions = new Array(matches.length);
	if(matches){
		for(var i=0; i<matches.length; i++){
			var match = matches[i];
			expressions[i]=new Expression(match[match.length-2], match[1]);
		}
	}
	return expressions;
}

/**
replace evaluated expressions in original data
**/
var process = function(data,expressions){
	var newData = "";
	var startIndex = 0;
	for(var i=0; i<expressions.length; i++){
		newData+= data.substr(startIndex,expressions[i].startIndex - startIndex) + exports.evaluate(expressions[i].data);
		startIndex = expressions[i].startIndex + expressions[i].data.length + 4;//length of '{{}}' is 2
	}
	newData+= data.substr(startIndex,data.length - startIndex);

	return newData;
}

/**
An expression can have either a function or marker.
However a funcion can have a function or marker parameters again.
**/
exports.evaluate = function(exp){

	if(isFunction(exp)){
		var fExp = buildFunctionExp(exp);
		for (var i = 0; i < fExp.args.length; i++) {
			if(isNumeric(fExp.args[i])){
				fExp.args[i] = Number(fExp.args[i]);
			}else if(isString(fExp.args[i])){
				fExp.args[i] = fExp.args[i].substr(1,fExp.args[i].length-2);
			}else if(isFunction(fExp.args[i])){
				fExp.args[i] = exports.evaluate(fExp.args[i]);
			}else{
				fExp.args[i] = evaluateMarker(fExp.args[i]);
			}
		}
		if(functions[fExp.name])
	    	return functions[fExp.name].apply(fExp.name,fExp.args);
	    else
	    	return "";
	}else{//marker
		return evaluateMarker(exp);
	}
	return "amit";
}

/**
Build functionExp for function expression has string, number, function or marker params
**/
const fRegx = '([a-zA-Z]+[a-zA-Z0-9]*)\\((.*(?!\\())\\)';
var buildFunctionExp = function(exp){
	var matches = util.getMatches(exp,fRegx);
	var inFunction = false;
	var args = [];
	var startIndex = 0;
	for(var i=0;i<matches[2].length;i++){
		if(matches[2][i] === '('){
			inFunction = true;
		}else if(matches[2][i] === ')'){
			inFunction = false;
		}else if(matches[2][i] === ',' && !inFunction){
			var param = matches[2].substr(startIndex,i);
			startIndex = i+1;
			args.push(param);
		}
	}
	var param = matches[2].substr(startIndex,i);
	args.push(param);

	return new FunctionExp(matches[1],args);
}

var evaluateMarker = function(exp){
	for(var marker in markers){
		if(markers[marker].exp){
			var regx = "^" + markers[marker].exp + "$";
			var result = util.getMatches(exp.toString(),regx);
			if(result){
				return evaluateMarker(markers[marker].evaluate(result));
			}
		}
	}

	return exp;
}

/**
A marker can't have small brackets, \", \' , \, , only numbers 
**/
/*var isMarker = function(str){
	return str.indexOf('"') === -1 || 
}*/

var isFunction = function(exp){
	return exp.indexOf('(') !== -1 ? true : false;
}

function isNumeric(n) {
 	return !isNaN(parseFloat(n)) && isFinite(n);
}

function isString(str){
	return str.length > 2
	&& (str.charAt(0) == '"' || str.charAt(0) == '\'')
	&& (str.charAt(str.length-1) == '"' || str.charAt(str.length-1) == '\'');
}
module.exports.fetch = fetch;
module.exports.process = process;
//module.exports.evaluate = evaluate;