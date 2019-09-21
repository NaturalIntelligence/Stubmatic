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

    it('should capture data from request body', function (done) {
        chai.request("http://localhost:9999")
            .post('/stubs/post2')
            .send( "name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("Mobile=781011111,781011111,{{post[2] }}");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should capture data from request body', function (done) {
        chai.request("http://localhost:9999")
            .post('/stubs/post3')
            .send( "name=Amit&Mobile=(44)781011111&Sal=100000.00&DOJ=25-APR-2012")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("44,44,781011111,781011111,100000");
                done();
            }).catch( err => {
                markFailed(err,fail,done);
            });
    });

    it('should capture data from request body', function (done) {
        chai.request("http://localhost:9999")
            .post('/stubs/post4')
            .send( "name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012")
            .then(res => {
                expect(res.status).toBe(200);
                expect(res.text).toBe("name=Amit&Mobile=781011111&Sal=100000.00&DOJ=25-APR-2012,781011111,{{post[2] }}");
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