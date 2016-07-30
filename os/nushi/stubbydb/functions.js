var util = require('./util/util');

exports.formatDate = function(dt_str,format){
	console.log(dt_str)
	var dt = util.formatDate(new Date(dt_str), format);
	console.log(dt)
	return dt;
};

exports.urlEncode = function(url){
	return encodeURI(url);
};

exports.random = function(N){
		var num1 = Math.pow(10, N);
		var num2 = Math.pow(10, N-1);
		num1 = num1 - num2;
		var randomnum = Math.floor(Math.random()*num1) + num2;
		return randomnum;
};