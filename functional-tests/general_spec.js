if (!global.Promise) {
  global.Promise = require('q');
}

var chai = require('chai')
  , chaiHttp = require('chai-http');

var { validateSyntax, cli} = require('../lib/cli');

 chai.use(chaiHttp);

try{
    cli(["node", "stubmatic", "-d","functional-tests/assets"/*, "-v"*/]);
}catch(err){
    console.log(err);
}

describe('FT', function () {

  describe('scenario::', function () {

    it('should response to GET short notation with response body', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/healthcheck')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("OK");
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    it('should response to HEAD short notation with default status', function (done) {
        chai.request("http://localhost:9999")
            .head('/stubs/healthcheck')
            .then(res => {
                expect(res.status).toBe(200);
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    it('should response without response body', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/status')
            .then(res => {
                expect(res.status).toBe(200);
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    //TODO: replace functionality for {{ url.1 }} is implemented
    it('should response to POST with dynamic body', function (done) {
        chai.request("http://localhost:9999")
            .post('/stubs/phone-123456789/body')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("spacing is optional. 123456789 and 123456789 are valid");
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    it('should response with fix delay', function (done) {
        var time = new Date();
        chai.request("http://localhost:9999")
            .get('/stubs/delay')
            .then(res => {
                expect(res.status).toBe(200);
                expect((new Date()) - time).toBeGreaterThan(1999);
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    it('should response with random delay', function (done) {
        var time = new Date();
        chai.request("http://localhost:9999")
            .get('/stubs/delay/random')
            .then(res => {
                expect(res.status).toBe(200);
                var interval = (new Date()) - time;
                expect(interval).toBeGreaterThan(999);
                expect(interval).toBeLessThan(2010);
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    it('should response immediately when err', function (done) {
        var time = new Date();
        chai.request("http://localhost:9999")
            .get('/stubs/delay/err')
            .then(res => {
                var interval = (new Date()) - time;
                expect(res.status).toBe(500);
                expect(interval).toBeLessThan(20);
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });


    it('should send deflated response', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/healthcheck')
            .set('Accept-Encoding','deflate')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("OK");
                expect(res.headers["content-encoding"]).toBe("deflate");
                done();
            }).catch( err => {
                fail("not expected");
                done();
            });
    });

    it('should send gzipped response', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/healthcheck')
            .set('Accept-Encoding','gzip')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("OK");
                expect(res.headers["content-encoding"]).toBe("gzip");
                done();
            }).catch( err => {
                fail("not expected");
                done();
            });
    });

    it('should support multiple methods', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/methods/multiple')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("multiple methods are supported");
            }).catch( err => {
                fail("not expected");
                done();
            });

        chai.request("http://localhost:9999")
            .post('/stubs/methods/multiple')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("multiple methods are supported");
                done();
            }).catch( err => {
                fail("not expected");
                done();
            });
        
        chai.request("http://localhost:9999")
            .put('/stubs/methods/multiple')
            .then(res => {
                expect(res.status).toBe(404);
                done();
            }).catch( err => {
                done.fail(err.message);
            });
    });

    it('should support single mapping for all methods', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/methods/all')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("You can bind all methods to single mapping.");
            }).catch( err => {
                fail("not expected");
                done();
            });

        chai.request("http://localhost:9999")
            .post('/stubs/methods/all')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("You can bind all methods to single mapping.");
                done();
            }).catch( err => {
                fail("not expected");
                done();
            });
        
    });

  });

  it("tear down for all tests", function() {
    //server.stop();
  });

});

function markFailed(err,fail,done){
    if(err.status === 404)
        fail("No matching mapping found");
    else
        fail(err.message);
    done();
}