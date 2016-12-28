var util = require('./util/util');
var LocalDateTime = require('js-joda').LocalDateTime;

//TPDAY, TPDAY+N, TODAY-N
exports.dateMarker = {
	exp : "TODAY(?:([\\+\\-])([0-9]+))?",
	evaluate : function(match){
		var dt = new Date();
		var operation = match[1];
		var days = parseInt(match[2]);

		if(match[1] == '+'){
			dt.setDate(dt.getDate() + days);
		}else if(match[1] == '-'){
			dt.setDate(dt.getDate() - days);
		}
		//util.formatDate(dt, "yyyy-mm-dd")
		return dt;
	}
};


//TODAY, TPDAY+N, TODAY-N
exports.dateMarker2 = {
	exp : "TODAY([\+\-][0-9]+[ymd])([\+\-][0-9]+[ymd])?([\+\-][0-9]+[ymd])?",
	evaluate : function(result){
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
		//util.formatDate(today, "yyyy-mm-dd")
		return today;

	}
};

//NOW, NOW+N, NOW-N
exports.jodaDateMarker = {
	exp : "JODA_TODAY(?:([\\+\\-])([0-9]+))?",
	evaluate : function(match){
		var today = LocalDateTime.now();
		var operation = match[1];
		var days = parseInt(match[2]);

		if(match[1] == '+'){
			today = today.plusDays(days);
		}else if(match[1] == '-'){
			today = today.minusDays(days);
		}
		return today;
	}
};

//NOW, NOW+N, NOW-N
exports.jodaDateMarker2 = {
		exp : "JODA_TODAY([\+\-][0-9]+[ymd])([\+\-][0-9]+[ymd])?([\+\-][0-9]+[ymd])?",
		evaluate : function(result){
		var today = LocalDateTime.now();
			for(var i = 1; i < result.length; i++) {
				var match = result[i];

				if(match){
					var operation = match[0];
					var identifier = match[match.length-1];
					var number = parseInt(match.substr(1,match.length-2));

					if(identifier == 'y'){
						if(operation == '+'){
							today = today.plusYears(number);	
						}else if(operation == '-'){
							today = today.minusYears(number);	
						}
					}else if(identifier == 'm'){					
						if(operation == '+'){
							today = today.plusMonths(number);
						}else if(operation == '-'){
							today = today.minusMonths(number);	
						}
					}else if(identifier == 'd'){
						if(operation == '+'){
							today = today.plusDays(number);
						}else if(operation == '-'){
							today = today.minusDays(number);	
						}
					}
				}
			}
			//util.formatDate(today, "yyyy-mm-dd")
			return today;
	}
};

