var util = require('./util/util');

//TPDAY, TPDAY+N, TODAY-N
exports.dateMarker = {
	exp : "TODAY(?:([\\+\\-])([0-9]+))?",
	action : function(match){
		var dt = new Date();
		var operation = match[1];
		var days = parseInt(match[2]);

		if(match[1] == '+'){
			dt.setDate(dt.getDate() + days);
		}else if(match[1] == '-'){
			dt.setDate(dt.getDate() - days);
		}
		return util.formatDate(dt, "yyyy-mm-dd");
	}
};


//TODAY, TPDAY+N, TODAY-N
exports.dateMarker2 = {
	exp : "TODAY([\+\-][0-9]+[ymd])([\+\-][0-9]+[ymd])?([\+\-][0-9]+[ymd])?",
	action : function(result){
		var today = new Date();
		for(var i = 1; i < result.length; i++) {
			var match = result[i];

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

		return util.formatDate(today, "yyyy-mm-dd");
	}
};

exports.urlMarker = {
	exp : "URL:(.+)",
	action : function(result){
		return encodeURI(result[1]);
	}
};


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