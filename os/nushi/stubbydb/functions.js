var util = require('./util/util');

exports.formatDate = function(dt_str,format){
	var dt = util.formatDate(new Date(dt_str), format);
	return dt;
};

exports.urlEncode = function(url){
	return encodeURI(url);
};

var charsets = [];
charsets['num'] = "0123456789";
charsets['alpha'] = "abcdefghijklmnopqrstuvwxyz";
charsets['alpha_num'] = "abcdefghijklmnopqrstuvwxyz0123456789";

exports.random = function(len,type){
    var text = "";
    var charset = "";
    console.log(type);
    if(!type)
    	charset = charsets['num'];
    else
    	charset = charsets[type.toLowerCase()];
    console.log(charset);
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}