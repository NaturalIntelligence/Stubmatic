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

    it('should response after including dumps with old style', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/dumps/body/old')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("Some text. dumps 1 and dumps 2. both dumps 1dumps 2");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });

    it('should response after including dumps with new syntax', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/dumps/body/new')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("Some text. dumps 1 and dumps 2. both dumps 1dumps 2");
                done();
            }).catch( err => {
                fail(err.message);
                done();
            });
    });
});