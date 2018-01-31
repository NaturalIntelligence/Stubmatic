var path = require("path");
const portfinder = require('portfinder');

describe('server', function () {

    var port = "7777";
    beforeEach(function(){
        portfinder.getPort(function (err, p) {
            port = p;
        });
    });
    
    it('would not be started when the port is not accessible', function (done) {
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "-p" : "8"});
        server.on("start",function(){
            fail("Not expected");
            done();
        });
        server.on("error",function(err){
            expect(err.code).toBe('EACCES');
            done();
        });
        server.on("request",function(err){
            fail("Not expected");
            done();
        });
        server.start();
    });

    it('should not be started when valid but unavailable host is given', function (done) {
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "--host" : "google.com"});
        server.on("start",function(){
            done.fail("Not expected");
        });
        server.on("error",function(err){
            expect(err.code).toMatch('ENOTFOUND|EADDRNOTAVAIL');
            done();
        });

        setTimeout(function() {
            done();
        }, 9000);

        server.start();
    },10000);

    it('should not be started when invalid host is given', function (done) {
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "--host" : "invalidhost"});
        server.on("start",function(){
            done.fail("Not expected");
        });
        server.on("error",function(err){
            expect(err.code).toMatch('ENOTFOUND|ENOTFOUNDEADDRNOTAVAILD');
            done();
        });

        setTimeout(function() {
            done();
        }, 9000);

        server.start();
    }, 10000);

    it('should not be started when port is not available', function (done) {
        require("http").createServer().listen(port);;
        
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "--host" : "localhost", "-p" : port});
        server.on("start",function(){
            done.fail("Not expected");
        });
        server.on("error",function(err){
            expect(err.code).toBe('EADDRINUSE');
            done();
        });
        server.start();
        
    });

    it('should start server', function (done) {
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "--host" : "localhost" , "-p" : "9998"});
        server.on("start",function(){
            done();
        });
        server.on("error",function(err){
            fail("Not expected");
            done();
        });
        server.start();
        
    }); 
       

});