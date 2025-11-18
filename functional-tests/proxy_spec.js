if (!global.Promise) {
  global.Promise = require('q');
}

var chai = require('chai')
  , chaiHttp = require('chai-http');

var { validateSyntax, cli} = require('../lib/cli');

 chai.use(chaiHttp);

try{
    cli(["node", "stubmatic", "-d","functional-tests/assets"/*, "-v"*/]);
}catch(err){
    console.log("Server is already started");
}

// try{
//     cli(["node", "stubmatic", "-d","functional-tests/assets/proxy" , "-p", "8003"/*, "-v"*/]);
// }catch(err){
//     console.log("Server is already started");
// }

describe('FT', function () {
    

    // it('should proxy request', function (done) {
    //     chai.request("http://localhost:9999")
    //         .get('/proxy/normal')
    //         .then(res => {
    //             expect(res.status).toBe(200);
    //             expect(res.text).toBe("simple response");
    //             done();
    //         }).catch( err => {
    //             done.fail("Not expected");
    //         });
    // });

    // it('should proxy request 404 response', function (done) {
    //     chai.request("http://localhost:9999")
    //         .get('/proxy/not-found')
    //         .then(res => {
    //             done.fail("Not expected");
    //             done();
    //         }).catch( err => {
    //             expect(err.status).toBe(404);
    //             done();
    //         });
    // });

    // it('should proxy request 500 response', function (done) {
    //     chai.request("http://localhost:9999")
    //         .post('/proxy/err')
    //         .send("post body")
    //         .then(res => {
    //             done.fail("Not expected");
    //         }).catch( err => {
    //             expect(err.status).toBe(500);
    //             done();
    //         });
    // });

    it('should proxy request 404 response', function (done) {
        chai.request("http://localhost:9999")
            .get('/index2.html')
            .then(res => {
                expect(res.status).toBe(404);
                done();
            }).catch( err => {
                done.fail("Not expected");
            });
    });
    
});