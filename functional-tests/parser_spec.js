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

    it('should return nimn data date compression', function (done) {
        chai.request("http://localhost:9999")
            .get('/nimn')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text.length).toBe(34);
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should return msgpack data', function (done) {
        chai.request("http://localhost:9999")
            .get('/msgpack')
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text.length).toBe(54);
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    
});

function markFailed(err,fail,done){
    fail(err.message);
}