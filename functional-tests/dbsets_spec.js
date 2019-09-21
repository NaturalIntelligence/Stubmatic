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

describe('dbsets', function () {

    it('should response after including data from dbsets', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/admin/001')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("<auth_id>safknf-34809n-skfnjk</auth_id><auth_id>##token##</auth_id>");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });

    it('should check other matching when key is not found in dbset', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/admin/010')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("(User is not authorized)|(User is deleted from the system)|(You are temporarily disabled in the system)");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });

    it('should check further matching when key is not found in any dbset', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/admin/004')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("<fault>This incident will be reported</fault>");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });

    it('should response after including value of default key when no matching key is found', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/customer/004')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("<auth_id>defaulttoken</auth_id><auth_id>##token##</auth_id>");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });

    it('should response after including value of any random key', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/customer')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toMatch("##token## (ab6998bkn|9790jmioh7083|avv|kjnj234)");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });
});