//// @ts-check
var random = require('./functions').random;
var os = require('os');

class RequestContext {
	constructor(request){
		this.url = request.url;
		this.headers = request.headers;
		this.query = request.query;
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
		this.resolved = null;
	}

	getTransactionId() {
		return this.transactionId;
	};
	howLong() {
		return (new Date()) - this.startTime;
	};
}

// method.rawResponse = function(res) {
//     this.response.raw = res;
// };

// method.refinedResponse = function(res) {
//     this.response.refined = res;
// };

module.exports = RequestContext;