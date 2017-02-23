
var net = require('net'),
    path = require('path'),
    Response = require('./encoder').Response;

//require('redis');
//var root = path.dirname(require.resolve('redis'));
var Parser = require('redis-parser');

var createServer = function() {
    var server = net.createServer({}, function(connection) {
        
        var parser = createNewParser(connection);
        connection.on('data', function(data) {
            console.log("rawInputCommand :: \t" + toSingleLine(data));
            parser.execute(data);
        });
    });
    return server;
};

function toSingleLine(data){
    return data.toString().replace(new RegExp("\r\n",'g'), "\\r\\n");
}

var createNewParser = function (connection){
    var response = new Response(connection);
    return new Parser({
        returnReply: function(reply) {
            commandHandler.call(response, reply);
        },
        returnError: function(err) {
            //lib.returnError(err);
            console.log(err);
        },
        returnFatalError: function (err) {
            //lib.returnFatalError(err);
            console.log(err);
        }
    });
}

var commandHandler = function(command) {
      console.log('query', command);
      /*var output = ['APPEND', 'AUTH']; 
      this.encode(output);// the answer*/

        if(command[0] === 'info') {
	        this.encode('redis_version:2.4.5');
	    }else if(command[0] === 'get') {
	        this.encode(["val2","val1"]);
	    }else if(command[0] === 'incr') {
	        this.encode(100);
	    }else{
	        this.singleline('OK');
	    }
}

exports.createServer = createServer;
exports.createNewParser = createNewParser;