if (!global.Promise) {
  global.Promise = require('q');
}

var chai = require('chai')
  , chaiHttp = require('chai-http')
  , expected = require('chai').expect;

var rewire = require('rewire'),
   cli = rewire(".././index").__get__("cli");

 chai.use(chaiHttp);

try{
    cli(["node", "stubmatic", "-d","functional-tests/assets"/*, "-v"*/]);
}catch(err){
    console.log(err);
}

describe('It', function () {


    it('should response with all cookies', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/cookies/response')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("This response will be served with cookies");
                expected(res).to.not.have.cookie('foo'); 
                expected(res).to.have.cookie('alpha', 'gamma'); 
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
    });

    it('should accept and match cookies', function (done) {
        chai.request("http://localhost:9999")
            .get('/stubs/cookies/request')
            .set("cookie", "alpha=gamma")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("This request requires cookies");
                done();
            }).catch( err => {
                done.fail("not expected " + err);
            });
    });

    
});