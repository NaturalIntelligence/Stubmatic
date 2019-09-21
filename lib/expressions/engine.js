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
	var matches = util.getAllMatchesWithMetaData(data,expRegx);
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
var process = function(data,expressions,rc,store){
	var newData = "";
	var startIndex = 0;
	for(var i=0; i<expressions.length; i++){
		const result = exports.evaluate(expressions[i].data,rc,store);
		if(result){
			newData+= data.substr(startIndex,expressions[i].startIndex - startIndex) + result
		}else{
			newData+= data.substr(startIndex, expressions[i].startIndex + expressions[i].data.length + 4)
		}
		startIndex = expressions[i].startIndex + expressions[i].data.length + 4;//length of '{{}}' is 2
	}
	newData+= data.substr(startIndex,data.length - startIndex);

	return newData;
}

/**
An expression can have either a function or marker.
However a funcion can have a function or marker parameters again.
**/
exports.evaluate = function(exp,rc,store){

	if(isFunction(exp)){
		var fExp = buildFunctionExp(exp);
		for (var i = 0; i < fExp.args.length; i++) {
			if(isNumeric(fExp.args[i])){
				fExp.args[i] = Number(fExp.args[i]);
			}else if(isString(fExp.args[i])){
				fExp.args[i] = fExp.args[i].substr(1,fExp.args[i].length-2);
			}else{
				fExp.args[i] = exports.evaluate(fExp.args[i],rc,store);
			}
		}
		if(functions[fExp.name])
	    	return functions[fExp.name].apply(fExp.name,fExp.args,rc,store);
	    else
	    	return "";
	}else{//marker
		return evaluateMarker(exp,rc,store);
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

var evaluateMarker = function(exp,rc,store){
	for(var marker in markers){
		if(markers[marker].exp){
			var regx = "^" + markers[marker].exp + "$";
			var result = util.getMatches(exp.toString(),regx);
			if(result){
				 const resultOfMatchingMarker = markers[marker].evaluate(result,rc,store)
				 //check for nested markers
				 const nestedResult = evaluateMarker(resultOfMatchingMarker, rc, store);
				 if(nestedResult) return nestedResult
				 else return resultOfMatchingMarker;
			}
		}
	}

	return false;
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