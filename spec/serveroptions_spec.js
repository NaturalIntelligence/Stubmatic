var rewire = require('rewire'),
    buildServerOptions = rewire(".././index").__get__("buildServerOptions");
    logger = require(".././lib/log");
var path = require("path");

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

    it('should set options with long arguments name', function () {
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