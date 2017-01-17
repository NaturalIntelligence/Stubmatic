var util = require('./util/util');
var fastLoremIpsum = require('fast-lorem-ipsum').fastLoremIpsum;
var logger = require('./log');
var path = require('path');
var fs = require('fs');

exports.formatDate = function(dt_str,format){
	var dt = util.formatDate(new Date(dt_str), format);
	return dt;
};

/*exports.JS = function(val){
    return val;
};*/

exports.urlEncode = function(url){
	return encodeURI(url);
};

var configBuilder = require("./configbuilder");
exports.dump = function(dumpPath,dumps){

    var dumpsdir = configBuilder.getConfig().dumps;
    var contentToreplace = "";
    for(var i=0; i<dumps.length; i++){
        var filePath= path.join(dumpsdir , dumpPath , dumps[i]);
        var readFileFlag = false;
        try{
            contentToreplace += fs.readFileSync(filePath, {encoding: 'utf-8'});
        }catch(err){
            logger.error(err);
        }
    }

    return contentToreplace ;
};

var charsets = [];
charsets['num'] = "0123456789";
charsets['alpha'] = "abcdefghijklmnopqrstuvwxyz";
charsets['alpha_num'] = "abcdefghijklmnopqrstuvwxyz0123456789";

exports.random = function(len,type){
    var text = "";
    var charset = "";
    if(!type)
    	charset = charsets['num'];
    else
    	charset = charsets[type.toLowerCase()];
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    return text;
}

//TODO: Need to be tested
/*exports.anyNumerBetween = function(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}*/

/*exports.anyDateBetween = function(start,end){
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

exports.anyDateAfter = function(days) {
    return new Date((new Date()).getTime() + (Math.random()*days*24*60*60*1000)); 
}

exports.anyDateBefore = function(days) {
    return new Date((new Date()).getTime() - (Math.random()*days*24*60*60*1000)); 
}*/

/*exports.anyEmailId = function(host){
    if(!host){
        host = exports.random(3,'alpha') + '.com';
    }
    return exports.anyEmailId(14,host);
}

exports.anyEmailId = function(len,host){
    return exports.random(len,'alpha_num') + '@' + host;
}


*/
