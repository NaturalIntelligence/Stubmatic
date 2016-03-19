var util = require('./util/util');

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
		data = data.replace(rgx,util.formatDate(dt, "yyyy-mm-dd"));
	}
	return data;
}

//TODAY, TPDAY+N, TODAY-N
exports.dateMarker2 = function(data){
	var regx= "\\{\\{TODAY([\+\-][0-9]+[ymd])([\+\-][0-9]+[ymd])?([\+\-][0-9]+[ymd])?\\}\\}";

	var markers = util.getAllMatches(data,regx);
	
	markers.forEach(function(marker_arr){
		var today = new Date();
		for (var i = 1; i < marker_arr.length - 2; i++) {
			var match = marker_arr[i];

			if(match){
				var operation = match[0];
				var identifier = match[match.length-1];
				var number = parseInt(match.substr(1,match.length-2));

				if(identifier == 'y'){
					if(operation == '+'){
						today.setFullYear(today.getFullYear() + number);	
					}else if(operation == '-'){
						today.setFullYear(today.getFullYear() - number);	
					}
				}else if(identifier == 'm'){
					if(operation == '+'){
						today.setMonth(today.getMonth() + number);	
					}else if(operation == '-'){
						today.setMonth(today.getMonth() - number);	
					}
				}else if(identifier == 'd'){
					if(operation == '+'){
						today.setDate(today.getDate() + number);	
					}else if(operation == '-'){
						today.setDate(today.getDate() - number);	
					}
				}
			}
		}
		var rgx = new RegExp(util.escapeRegExp(marker_arr[0]),"g");
		data = data.replace(rgx,util.formatDate(today, "yyyy-mm-dd"));
	});
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