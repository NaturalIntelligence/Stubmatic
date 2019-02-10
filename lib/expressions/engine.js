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
			expressions[i]=new Expression( match[2], match[1]);
		}
	}
	return expressions;
}

/**
replace evaluated expressions in original data
**/
var process = function(data,expressions,rc){
	var newData = "";
	var startIndex = 0;
	for(var i=0; i<expressions.length; i++){
		newData+= data.substr(startIndex,expressions[i].startIndex - startIndex) + exports.evaluate(expressions[i].data,rc);
		startIndex = expressions[i].startIndex + expressions[i].data.length + 4;//length of '{{}}' is 2
	}
	newData+= data.substr(startIndex,data.length - startIndex);

	return newData;
}

/**
An expression can have either a function or marker.
However a funcion can have a function or marker parameters again.
**/
exports.evaluate = function(exp,rc){

	if(isFunction(exp)){
		var fExp = buildFunctionExp(exp);
		for (var i = 0; i < fExp.args.length; i++) {
			if(isNumeric(fExp.args[i])){
				fExp.args[i] = Number(fExp.args[i]);
			}else if(isString(fExp.args[i])){
				fExp.args[i] = fExp.args[i].substr(1,fExp.args[i].length-2);
			}else{
				fExp.args[i] = exports.evaluate(fExp.args[i],rc);
			}
		}
		if(functions[fExp.name])
	    	return functions[fExp.name].apply(fExp.name,fExp.args,rc);
	    else
	    	return "";
	}else{//marker
		return evaluateMarker(exp,rc);
	}
}

/**
Build functionExp for function expression has string, number, function or marker params
**/
var buildFunctionExp = function(exp){
	var paramStart = 0, startIndex = 0;
	var inFunction = false, nestedFunction = false;
	var args = [];
	for(var i=0;i<exp.length;i++){
	    if(nestedFunction){
	       if(exp[i] === ')'){
	         nestedFunction = false;
	       }
	    }else if(exp[i] === '(') {
			if(inFunction === false){
		        paramStart = i;
		        startIndex = i+1;
		        inFunction = true;
		      }else{
		        nestedFunction = true;
		      }	
		}else if(exp[i] === ')'){
	    	args.push(exp.substring(startIndex,i));
		}else if(exp[i] === ','){
			args.push(exp.substring(startIndex,i));
			startIndex = i+1;
		}
	}
	
	return new FunctionExp(exp.substr(0,paramStart),args);
}

var evaluateMarker = function(exp,rc){
	for(var marker in markers){
		if(markers[marker].exp){
			var regx = "^" + markers[marker].exp + "$";
			var result = util.getMatches(exp.toString(),regx);
			if(result){
				return evaluateMarker(markers[marker].evaluate(result,rc));
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
	&& (str.charAt(0) === '"' || str.charAt(0) === '\'')
	&& (str.charAt(str.length-1) === '"' || str.charAt(str.length-1) === '\'');
}
module.exports.fetch = fetch;
module.exports.process = process;
//module.exports.evaluate = evaluate;