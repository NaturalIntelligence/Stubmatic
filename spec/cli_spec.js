var rewire = require('rewire'),
    buildServerOptions = rewire(".././index").__get__("buildServerOptions");
    logger = require(".././lib/log");
var path = require("path");

describe('CLI', function () {
    
    var climodule = rewire(".././index");
    var cli = climodule.__get__("cli");

    it('should log version number', function () {
        spyOn(console,"log");
        cli(["node", "stubmatic", "--version" ,"tobeignored"]);

        expect(console.log.calls.count()).toEqual(1);
        expect(console.log.calls.argsFor(0)[0]).toEqual( "5.0.0");
    });

    it('should log help', function () {
        spyOn(console,"log");
        cli(["node", "stubmatic", "--help" ,"tobeignored"]);

        expect(console.log.calls.count()).toEqual(1);
        expect(console.log.calls.argsFor(0)[0]).toEqual( jasmine.any(String));

        console.log.calls.reset();
        cli(["node", "stubmatic", "-h" ,"tobeignored"]);

        expect(console.log.calls.count()).toEqual(1);
        expect(console.log.calls.argsFor(0)[0]).toEqual( jasmine.any(String));
    });

    it('should call to create sample repo', function () {
        var reporCreater = require('.././init');
        spyOn(reporCreater,"init");
        cli(["node", "stubmatic", "init"]);
        expect(reporCreater.init).toHaveBeenCalledWith("stub-repo");

        cli(["node", "stubmatic", "init", "reponame"]);
        expect(reporCreater.init).toHaveBeenCalledWith("reponame");
    });

    it('should not start server when invalid argument is passed', function () {
        spyOn(logger,'setVerbose').and.callFake(() => {});
        spyOn(console,'log');
        var server = require('.././lib/server');
        spyOn(server,'setup');

        expect(function() {buildServerOptions(["node", "stubmatic", "-invalid"]);})
            .toThrow(new Error("Invalid options"));
        
        expect(console.log.calls.argsFor(0)[0]).toBe("Invalid options");
        expect(console.log.calls.argsFor(1)[0]).toBe("Try 'stubmatic --help' for more information.");
        expect(server.setup.calls.count()).toBe(0);
    });

    it('should start server when valid arguments are passed', function () {
        spyOn(logger,'setVerbose').and.callFake(() => {});
        spyOn(console,'log');
        var server = require('.././lib/server');
        spyOn(server,'setup');
        spyOn(server,'start');

        cli(["node", "stubmatic"]);

        expect(server.setup.calls.count()).toBe(1);
        expect(server.start.calls.count()).toBe(1);
    });

    var buildServerOptions = climodule.__get__("buildServerOptions");
    describe('serveroptions', function () {

        it('should set directory path', function () {
            var result = buildServerOptions(["node", "stubmatic", "-d" ,"."]);
            expect(result).toEqual({"-d" : "."});
            
            result = buildServerOptions(["node", "stubmatic", "-d" ,".././spec/test_assets"]);
            expect(result).toEqual({"-d" : path.join(process.cwd() , "../spec/test_assets")});
        });

        it('should set options', function () {
            spyOn(logger,'setVerbose').and.callFake(() => {});
            spyOn(logger,'writeLogs').and.callFake(() => {});
            spyOn(logger,'debugLogs').and.callFake(() => {});

            var result = buildServerOptions(["node", "stubmatic", 
                "-v",
                "-p" ,"1234",
                "-c" , "configFileName.json",
                "-l" ,
                "--debug",
                "-P" ,"2345",
                "--host" ,"localhost",
                "--mutualSSL" ,"false"]);
            expect(result).toEqual({"-p" : "1234",
                        "-c" : "configFileName.json",
                        "-P" : "2345",
                        "--host" : "localhost",
                        "--mutualSSL" : "false"
                        });
            expect(logger.setVerbose).toHaveBeenCalledWith(true);
            expect(logger.writeLogs).toHaveBeenCalledWith(true);
            expect(logger.debugLogs).toHaveBeenCalledWith(true);
        });

        it('should set options with long arguments name', function () {
            spyOn(logger,'setVerbose').and.callFake(() => {});
            spyOn(logger,'writeLogs').and.callFake(() => {});
            spyOn(logger,'debugLogs').and.callFake(() => {});

            var result = buildServerOptions(["node", "stubmatic", 
                "--verbose",
                "--port" ,"1234",
                "--config" , "configFileName.json",
                "--logs" ,
                "--debug",
                "-P" ,"2345",
                "--host" ,"localhost",
                "--mutualSSL" ,"false"]);
            expect(result).toEqual({"-p" : "1234",
                        "-c" : "configFileName.json",
                        "-P" : "2345",
                        "--host" : "localhost",
                        "--mutualSSL" : "false"
                        });
            expect(logger.setVerbose).toHaveBeenCalledWith(true);
            expect(logger.writeLogs).toHaveBeenCalledWith(true);
            expect(logger.debugLogs).toHaveBeenCalledWith(true);
        });

        it('should throw an error when invalid argument is passed', function () {
            spyOn(logger,'setVerbose').and.callFake(() => {});
            spyOn(console,'log');

            expect(function() {buildServerOptions(["node", "stubmatic", 
                "--verbose",
                "-invalid",
                "--port" ,"1234",
                "--debug",
                "--mutualSSL" ,"false"]);}
            ).toThrow(new Error("Invalid options"));
            
            expect(console.log.calls.argsFor(0)[0]).toBe("Invalid options");
            expect(console.log.calls.argsFor(1)[0]).toBe("Try 'stubmatic --help' for more information.");
            expect(logger.setVerbose).toHaveBeenCalledWith(true);
        });

    });

    
});
