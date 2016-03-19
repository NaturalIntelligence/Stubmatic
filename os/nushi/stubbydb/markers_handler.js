var markers = require('./markers.js');

exports.handle = function(data){
	for(var marker in markers){
		data = markers[marker](data);
	}
	return data;
}