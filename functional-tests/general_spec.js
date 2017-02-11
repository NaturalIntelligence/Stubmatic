if (!global.Promise) {
  global.Promise = require('q');
}

var chai = require('chai')
  , chaiHttp = require('chai-http');

var rewire = require('rewire'),
   cli = rewire(".././index").__get__("cli");

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
            //.send( "new property to match and capture request body")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("OK");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response to HEAD short notation with default status', function (done) {
        chai.request("http://localhost:9999")
            .head('/stubs/healthcheck')
            .then(res => {
                expect(res.status).toBe(200);
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response without response body', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/status')
            .then(res => {
                expect(res.status).toBe(200);
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    //TODO: replace functionality for {{ url.1 }} is implemented
    it('should response to POST with dynamic body', function (done) {
        chai.request("http://localhost:9999")
            .post('/stubs/phone-123456789/body')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("from old solution 123456789 and from new solution  url.1 ");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });
    
    it('should response with dynamic file data', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/id-1/name-amit')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: amit");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response with dynamic file data', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/id-2/name-nushi')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("This is from another file nushi");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
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
                markFailed(err,fail,done);
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
                expect(interval).toBeLessThan(2001);
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response immediately when err', function (done) {
        var time = new Date();
        chai.request("http://localhost:9999")
            .get('/stubs/delay/err')
            .then(res => {
                fail("not expected");
            }).catch( err => {
                expect(err.status).toBe(500);
                var interval = (new Date()) - time;
                expect(interval).toBeLessThan(10);
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