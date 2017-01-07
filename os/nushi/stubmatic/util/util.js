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

var monthNames = [
  "January", "February", "March",
  "April", "May", "June", "July",
  "August", "September", "October",
  "November", "December"
];

var Days = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

exports.formatDate = function(dt,format){
  format = format.replace('ss', exports.pad(dt.getSeconds(),2));
  format = format.replace('s', dt.getSeconds());
  format = format.replace('dd', exports.pad(dt.getDate(),2));
  format = format.replace('d', dt.getDate());
  format = format.replace('mm', exports.pad(dt.getMinutes(),2));
  format = format.replace('m', dt.getMinutes());
  format = format.replace('MMMM', monthNames[dt.getMonth()]);
  format = format.replace('MMM', monthNames[dt.getMonth()].substring(0,3));
  format = format.replace('MM', exports.pad(dt.getMonth()+1,2));
  format = format.replace('M', dt.getMonth()+1);
  format = format.replace('DD', Days[dt.getDay()]);
  format = format.replace(/D(?!e)/, Days[dt.getDay()].substring(0,3));
  format = format.replace('yyyy', dt.getFullYear());
  format = format.replace('YYYY', dt.getFullYear());
  format = format.replace('yy', (dt.getFullYear()+"").substring(2));
  format = format.replace('YY', (dt.getFullYear()+"").substring(2));
  format = format.replace('HH', exports.pad(dt.getHours(),2));
  format = format.replace('H', dt.getHours());
  //format = format.replace(/"/g,'');
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

exports.getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}