var random = require('./functions').random;
var os = require('os');

function RequestContext(request) {
	this.url = request.url;
	this.headers = request.headers;
	this.method = request.method;
	this.body = request.post;
	this.transactionId = random(10,'alpha_num')
	this.startTime = new Date();
	this.response = {};
	this.projectPath = global.basePath;
	this.server = {};
	this.server.memory = {};
	this.server.memory.total = os.totalmem();
	this.server.memory.free = os.freemem();
	this.server.hostname = os.hostname();
}
var method = RequestContext.prototype;

method.getTransactionId = function() {
    return this.transactionId;
};

method.howLong = function() {
    return (new Date()) - this.startTime;
};

// method.rawResponse = function(res) {
//     this.response.raw = res;
// };

// method.refinedResponse = function(res) {
//     this.response.refined = res;
// };

module.exports = RequestContext;