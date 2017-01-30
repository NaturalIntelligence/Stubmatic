var util = require('./util/util');
var LocalDateTime = require('js-joda').LocalDateTime;
var dbsetLoader = require('./loaders/dbset_loader');

//TODAY, TPDAY+N, TODAY-N
//DEPRECATED
exports.dateMarker = {
	exp : "TODAY(?:([\\+\\-])([0-9]+))?",
	evaluate : function(match){
		var dt = exports.now();
		var days = parseInt(match[2],10);

		if(match[1] === '+'){
			dt.setDate(dt.getDate() + days);
		}else if(match[1] === '-'){
			dt.setDate(dt.getDate() - days);
		}
		return dt;
	}
};


//TODAY, TPDAY+N, TODAY-N
exports.dateMarker2 = {
	exp : "TODAY([\+\-][0-9]+[ymd])([\+\-][0-9]+[ymd])?([\+\-][0-9]+[ymd])?",
	evaluate : function(result){
		var today = exports.now();
		for(var i = 1; i < result.length; i++) {
			var match = result[i];

			if(match){
				var identifier = match[match.length-1];
				var number = Number(match.substr(0,match.length-1));
				if(identifier === 'y'){
					today.setFullYear(today.getFullYear() + number);	
				}else if(identifier === 'm'){
					today.setMonth(today.getMonth() + number);	
				}else if(identifier === 'd'){
					today.setDate(today.getDate() + number);	
				}
			}
		}
		return today;

	}
};

//DEPRECATED
exports.jodaDateMarker = {
	exp : "JODA_TODAY(?:([\\+\\-])([0-9]+))?",
	evaluate : function(match){
		var today = exports.nowJoda();
		var operation = match[1];
		var days = parseInt(match[2],10);

		if(match[1] === '+'){
			today = today.plusDays(days);
		}else if(match[1] === '-'){
			today = today.minusDays(days);
		}
		return new Date(today.toLocalDate() + " " + today.toLocalTime());
	}
};

//NOW, NOW+N, NOW-N
exports.jodaDateMarker2 = {
		exp : "JODA_TODAY([\+\-][0-9]+[ymd])([\+\-][0-9]+[ymd])?([\+\-][0-9]+[ymd])?",
		evaluate : function(result){
		var today = exports.nowJoda();
		for(var i = 1; i < result.length; i++) {
			var match = result[i];

			if(match){
				var identifier = match[match.length-1];
				var number = Number(match.substr(0,match.length-1));

				if(identifier === 'y'){
					today = today.plusYears(number);	
				}else if(identifier === 'm'){					
					today = today.plusMonths(number);
				}else if(identifier === 'd'){
					today = today.plusDays(number);
				}
			}
		}
		return new Date(today.toLocalDate() + " " + today.toLocalTime());
	}
};

//handle strategy: random (not *)
//default key: *
//skip

exports.dbkeys = {
	exp : "#([a-zA-Z0-9_]+)",
	evaluate : function(match,rc){
		var colName = match[1];
		var dbset = rc.resolved.dbset;
		var dbsets = dbsetLoader.getDBsets();
		var row = dbsets[dbset.db].get(dbset.key);

		if(row){
			return row.value[colName];	
		}else{
			return "";
		}
	}
}

/*exports.requestCapture = {
	exp : "(url|post|headers|query)\.([0-9]+)",
	evaluate : function(result){
		return "gupta";
	}
}*/
exports.now = function(){
	return new Date();
}

exports.nowJoda = function(){
	return LocalDateTime.now();
}