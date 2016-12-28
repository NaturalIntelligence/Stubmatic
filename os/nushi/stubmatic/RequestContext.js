var random = require('./functions').random;

function RequestContext(request) {
	this.url = request.url;
	this.headers = request.headers;
	this.method = request.method;
	this.body = request.post;
	this.transactionId = random(10,'alpha_num')
	this.startTime = new Date();
	this.response = {};
}
var method = RequestContext.prototype;

method.getTransactionId = function() {
    return this.transactionId;
};

method.howLong = function() {
    return (new Date()) - this.startTime;
};

method.rawResponse = function(res) {
    this.response.raw = res;
};

method.refinedResponse = function(res) {
    this.response.refined = res;
};

module.exports = RequestContext;