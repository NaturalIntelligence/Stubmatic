
var net = require('net'),
    path = require('path'),
    Response = require('./encoder').Response;

//require('redis');
var root = path.dirname(require.resolve('redis'));
var Parser = require('redis-parser');

var createServer = function(onCommand) {
    var server = net.createServer({}, function(connection) {
        var parser = new Parser({
            returnReply: function(reply) {
                onCommand.call(response, reply);
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

        var response = new Response(connection);
                                        
        connection.on('data', function(data) {
            console.log("rawInputCommand :: \t" + data.toString().replace(new RegExp("\r\n",'g'), "\\r\\n"));
            parser.execute(data);
        });
    });
    return server;
};

exports.createServer = createServer;