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

    it('should response when matching query param and URL is found', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/query')
            .query({id: 123, name: "amit", extra : "extra"})
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("with 2 query params. 123, mit");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should response when wrong query param value is passed', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/query')
            .query({id: "123a", name: "amit"})
            .then(res => {
                fail("Successful response is expected");
            }).catch( err => {
                expect(err.status).toBe(404);
                done();
            });
    });

    it('should response when multiple mixed query param are passed', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/query')
            .query({static: "amit", reg: "guptacust1", multireg : "aamit1"})
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("N/A|cust|amit1|amit|1|<% query.5 %>");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });
});

function markFailed(err,fail,done){
    fail(err.message);
}