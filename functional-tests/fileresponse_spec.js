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

    it('strategy: should response from second file', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/not-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("Sample File contents");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from random file if exist otherwise 500 if file is not exist', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/random')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("(id: 1; name: <% url.2 %>)|(Sample File contents)|(file 3)");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from next file in round robin fashion', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
            }).catch( err => {
                markFailed(err,fail,done);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin')
            .then(res => {
                fail("successful response is not expected");
            }).catch( err => {
                //expect(res.status).toBe(500);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("file 3");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from next file exist in round robin fashion', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
            }).catch( err => {
                markFailed(err,fail,done);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("file 3");
            }).catch( err => {
                markFailed(err,fail,done);
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response from next file exist in round robin fashion', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/random-first-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("(id: 1; name: <% url.2 %>)|(file 3)");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response when matching query param and URL is found', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found/multi')
            .then(res => {
                expect(res.status).toBe(202);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
            }).catch( err => {
                markFailed(err,fail,done);
            });

        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found/multi')
            .then(res => {
                expect(res.status).toBe(203);
                expect(res.text).toBe("file 3");
                done()
            }).catch( err => {
                markFailed(err,fail)
            });
        
        chai.request("http://localhost:9999")
            .get('/stubs/round-robin-first-found/multi')
            .then(res => {
                expect(res.status).toBe(202);
                expect(res.text).toBe("id: 1; name: <% url.2 %>");
            }).catch( err => {
                markFailed(err,fail,done);
            });

    });

    it('should respond with 500 when unsupported strategy given', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/unsupported-strategy')
            .then(res => {
                done.fail("not expected");
            }).catch( err => {
                expect(err.status).toBe(500);
                done();
            });
    });

    it('should respond with  500 when invalid strategy given', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/invalid-strategy')
            .then(res => {
                done.fail("not expected");
            }).catch( err => {
                expect(err.status).toBe(500);
                done()
            });
    });
});

function markFailed(err,fail,done){
    if(err.status === 404)
        done.fail("No matching mapping found");
    else
        done.fail(err.message);
}