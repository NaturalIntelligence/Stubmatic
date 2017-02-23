var redisd = require('./lib/redis/server');
var server = redisd.createServer();
server.listen(6370, function() {//6379
    console.log('stub redis started');
});
