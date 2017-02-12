var path = require("path");

describe('server', function () {
    
    it('should not be started when the port is not accessible', function (done) {
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
            fail("Not expected");
            done();
        });
        server.on("error",function(err){
            expect(err.code).toBe('EADDRNOTAVAIL');
            done();
        });
        server.start();
    });

    it('should not be started when invalid host is given', function (done) {
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "--host" : "invalidhost"});
        server.on("start",function(){
            fail("Not expected");
            done();
        });
        server.on("error",function(err){
            expect(err.code).toBe('ENOTFOUND');
            done();
        });
        server.start();
    });

    it('should not be started when port is not available', function (done) {
        require("http").createServer().listen(7777);;
        
        var server = require('.././lib/server');
        server.setup({ "-d" : path.join(__dirname, "spec/test_assets"), "--host" : "localhost"});
        server.on("start",function(){
            fail("Not expected");
            done();
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