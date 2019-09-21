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

    it('should send the xml file as attachment', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/attachment/xml')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.headers["content-type"]).toBe("application/xml");
                done();
            }).catch( err => {
                done.fail("not expected");
            });
    });

    it('should send next exist file as attachment', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/attachment/not-found')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.headers["content-type"]).toBe("application/xml");
                done();
            }).catch( err => {
                done.fail("not expected");
            });
    });

    it('should send pdf file as attachment', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/attachment/pdf')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.headers["content-type"]).toBe("application/pdf");
                done();
            }).catch( err => {
                done.fail("not expected");
            });
    });

    it('should response with 500 when file is not found', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/attachment/invalid')
            .then(res => {
                expect(res.status).toBe(500);
                done();
            }).catch( err => {
                done.fail("not expected");
            });
    });

    it('should send invalid data when file attribute is not used', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/attachment/invalidattr')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe(undefined);
                expect(res.headers["content-type"]).toBe("application/pdf");
                done();
            }).catch( err => {
                done.fail("not expected");
            });
    });

});