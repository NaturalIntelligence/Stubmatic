var markers = require('./markers.js');

exports.replaceMarkers = function(data){
	for(var marker in markers){
		data = markers[marker](data);
	}
	return data;
}