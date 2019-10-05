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
  	for(let i=0; i< match.length; i++){
  		var submatch = match[i];
  		allmatches.push(submatch);
  	}
    matches.push(allmatches);
  }
  return matches;
}
exports.getAllMatchesWithMetaData = function(string, regex_str) {
  regex = new RegExp(regex_str,"g");
  var matches = [];
  var match;
  while (match = regex.exec(string)) {
    var allmatches = [];
    for(let i in match){
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
  format = format.replace('ss', pad(dt.getSeconds(),2));
  format = format.replace('s', dt.getSeconds());
  format = format.replace('dd', pad(dt.getDate(),2));
  format = format.replace('d', dt.getDate());
  format = format.replace('mm', pad(dt.getMinutes(),2));
  format = format.replace('m', dt.getMinutes());
  format = format.replace('MMMM', monthNames[dt.getMonth()]);
  format = format.replace('MMM', monthNames[dt.getMonth()].substring(0,3));
  format = format.replace('MM', pad(dt.getMonth()+1,2));
  format = format.replace(/M(?![ao])/, dt.getMonth()+1);
  format = format.replace('DD', Days[dt.getDay()]);
  format = format.replace(/D(?!e)/, Days[dt.getDay()].substring(0,3));
  format = format.replace('yyyy', dt.getFullYear());
  format = format.replace('YYYY', dt.getFullYear());
  format = format.replace('yy', (dt.getFullYear()+"").substring(2));
  format = format.replace('YY', (dt.getFullYear()+"").substring(2));
  format = format.replace('HH', pad(dt.getHours(),2));
  format = format.replace('H', dt.getHours());
  //format = format.replace(/"/g,'');
  return format;
}

var pad = function(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

exports.getRandomInt = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

exports.fileNameFromUrl = function (url , limit){
  if(!limit) limit = 20;
	if(url[url.length-1] === "/") url = url.substr(0, url.length - 1);
	let fileName   = 			 url.substring(url.lastIndexOf('/')+1);
	let ext  = 			           fileName.substring(fileName.lastIndexOf("\.") );
  if(ext === fileName) ext = ""
  if(ext)                       fileName =  fileName.substr(0, fileName.length - ext.length );
	if(fileName.length > limit) fileName = fileName.substr(0,limit);
	return {
		name: fileName,
		ext : ext
	}
}