// @ts-check

/**
Replace {{ x[n] }} placeholder with matches from the request

Eg: {{ url[2] }}
* @param {string} data
* @param {object} requestMatches  with properties url, headers, query etc.
 */
module.exports =  function(data, requestMatches){
	data = "" + data;
	for(var matching_key in requestMatches){
	  var part = requestMatches[matching_key];
	  for(var i=0;i<part.length;i++){
			const rgx = new RegExp("{{\\s*"+ matching_key +"\\[\\s*"+ i +"\\s*\\]\\s*}}","g");
			data = data.replace(rgx,part[i]); 
	  }
	}
	return data;
}