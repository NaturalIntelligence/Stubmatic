var redis = require('redis');
var client = redis.createClient(6379, 'localhost', {no_ready_check: true});
client.auth('password', function (err) {
    //console.log(err);
});

client.on('connect', function() {
    console.log('Connected to Redis');
});

client.on('data', function(data) {
    console.log('DATA::' + data);
});

client.set("foo", "bar", redis.print);
client.get("foo", function (err, reply) {
    console.log(err);
    console.log(reply.toString());
});

/*client.on('ready', function() {
  return client.subscribe('your_namespace:machine_name');
});*/

client.on('message', function(channel, json_message) {
  console.log(JSON.parse(message));
  // do whatever you vant with the message
});