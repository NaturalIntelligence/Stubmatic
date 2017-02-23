var redisd = require('./lib/redis/server');
var net = require('net');
var server = redisd.createServer();

var localport = 6370;
var remotehost = "0.0.0.0";
var remoteport = 6379;//redis port

var server = net.createServer(function (localsocket) {
  //var parser = redisd.createNewParser(localsocket);
  var remotesocket = new net.Socket();

  remotesocket.connect(remoteport, remotehost);

  localsocket.on('connect', function (data) {
    console.log(">>> connection #%d from %s:%d",
      server.connections,
      localsocket.remoteAddress,
      localsocket.remotePort
    );
	
  });

  localsocket.on('data', function (data) {
    console.log("%s:%d - writing data to remote",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
	console.log("rawInputCommand :: \t" + toSingleLine(data));
    //parser.execute(data);
    var flushed = remotesocket.write(data);
    if (!flushed) {
      console.log("  remote not flushed; pausing local");
      localsocket.pause();
    }
  });

  remotesocket.on('data', function(data) {
    console.log("%s:%d - writing data to local",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    console.log("rawInputCommand :: \t" + toSingleLine(data));
    var flushed = localsocket.write(data);
    if (!flushed) {
      console.log("  local not flushed; pausing remote");
      remotesocket.pause();
    }
  });

  localsocket.on('drain', function() {
    console.log("%s:%d - resuming remote",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    remotesocket.resume();
  });

  remotesocket.on('drain', function() {
    console.log("%s:%d - resuming local",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    localsocket.resume();
  });

  localsocket.on('close', function(had_error) {
    console.log("%s:%d - closing remote",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    remotesocket.end();
  });

  remotesocket.on('close', function(had_error) {
    console.log("%s:%d - closing local",
      localsocket.remoteAddress,
      localsocket.remotePort
    );
    localsocket.end();
  });

});


server.listen(localport, function() {
    console.log('redis proxy started at ' + localport);
});

function toSingleLine(data){
    return data.toString().replace(new RegExp("\r\n",'g'), "\\r\\n");
}