var deasync = require('deasync');

exports.getMatches = function(string, regex_str) {
  var regex = new RegExp(regex_str,"g");
  var matches = regex.exec(string);
  if(matches){
	  return matches;	
  }
}

exports.getAllMatches = function(string, regex_str) {
  regex = new RegExp(regex_str,"g");
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
  	var allmatches = [];
  	for(var i in match){
  		var submatch = match[i];
  		allmatches.push(submatch);
  	}
    matches.push(allmatches);
  }
  return matches;
}

exports.clone = function(obj){
  return JSON.parse(JSON.stringify(obj));
}

exports.wait = function(ms){
	deasync.sleep(ms);
}


exports.formatDate = function(dt,format){
  format = format.replace('yyyy', dt.getFullYear());
  format = format.replace('dd', exports.pad(dt.getDate(),2));
  format = format.replace('mm', exports.pad(dt.getMonth()+1,2));
  return format;
}

exports.pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}


exports.escapeRegExp = function(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}