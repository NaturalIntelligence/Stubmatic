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
    console.log("Server is already started");
}

describe('FT', function () {

    it('should response when matching header and URL is found', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/header')
            .set("custom","Custom")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("N/A<% headers.1 %>");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response when matching dynamic header and URL is found', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/header')
            .set("custom","cust1")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("N/A cust");
                expect(res.headers.rh).toBe("somevalue");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response with 404 when wrong header value is given', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/header')
            .set("custom","cust123")
            .then(res => {
                expect(res.status).toBe(404);
                done();
            }).catch( err => {
                done.fail("Successful is not expected");
            });
    });

    it('should response when multiple matching headers are passed', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/header')
            .set("static","amit")
            .set("reg","guptacust1")
            .set("multireg","aamit1")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("N/A|cust|amit1|amit|1|<% headers.5 %>");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response when specified headers are not present in the request', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/neagative/header')
            .set("multireg","aamit1")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("success");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response 404 when specified headers is present in the request', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/neagative/header')
            .set("static","amit")
            .set("multireg","aamit1")
            .then(res => {
                expect(res.status).toBe(404);
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

});

function markFailed(err,fail,done){
    if(err.status === 404)
        fail("No matching mapping found");
    else
        fail(err.message);
    done();
}