var dateFormat = require('dateformat');
var util = require('./util');

//TPDAY, TPDAY+N, TODAY-N
exports.dateMarker = function(data){
	var regx = "\\{\\{TODAY(?:([\\+\\-])([0-9]+))?\\}\\}";
	var matches = util.getAllMatches(data,regx);

	for(var i in matches){

		var dt = new Date();
		var match = matches[i];
		var operation = match[1];
		var days = parseInt(match[2]);

		if(match[1] == '+'){
			dt.setDate(dt.getDate() + days);
		}else if(match[1] == '-'){
			dt.setDate(dt.getDate() - days);
		}
		
		rgx = new RegExp(util.escapeRegExp(match[0]),"g");
		data = data.replace(rgx,dateFormat(dt, "yyyy-mm-dd"));
	}
	return data;
}

exports.urlMarker = function(data){
	var regx = "\\{\\{URL:([^\\}]+)\\}\\}";
	var matches = util.getAllMatches(data,regx);
	for(var i in matches){
		var match = matches[i];
		data = data.replace(match[0],encodeURI(match[1]));
	}
	return data;
}

exports.urlMarker = function(data){
	var regx = "\\{\\{URL:([^\\}]+)\\}\\}";
	var matches = util.getAllMatches(data,regx);
	for(var i in matches){
		var match = matches[i];
		data = data.replace(match[0],encodeURI(match[1]));
	}
	return data;
}

//tariff ID : RANDOM:5
/*exports.random = function(data){
	regx = /\{\{RANDOM:([0-9]+)\}\}/g;
	regex.exec(data)

	num1 = Math.pow(10, N);
	num2 = Math.pow(10, N-1);
	num1 = num1 - num2;
	ransomnum = Math.floor(Math.random()*num1) + num2;
	//Math.floor(Math.random()*90000) + 10000; //5 digit
	return data.replace(/\{\{RANDOM:([0-9]+)\}\}/g,ransomnum);
}*/