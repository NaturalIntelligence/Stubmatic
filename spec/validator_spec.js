var rewire = require('rewire'),
    validate = rewire(".././index").__get__("validateSyntax");
var path = require("path");

describe('CLI', function () {

    beforeEach(() => {
        spyOn(console,'log');
    });

    it('should give an error when file doesn\'t exist', function () {
        validate("notexist");
        expect(console.log).toHaveBeenCalledWith("Unsupported file");

        validate("notexist.json");
        expect(console.log).toHaveBeenCalledWith("Validation failed");
    });

    it('should validate JSON file', function () {
        validate(path.join(__dirname, "test_assets/config.json"));
        expect(console.log).toHaveBeenCalledWith("Validated successfully");
    });

    it('should validate YAML/YML file', function () {
        validate(path.join(__dirname, "test_assets/mappings/mapping1.yaml"));
        expect(console.log).toHaveBeenCalledWith("Validated successfully");
    });

    // it('should validate XML file', function () {

    // });

    it('should log error when invalid JSON file', function () {
        validate(path.join(__dirname, "test_assets/files/invalidConfig.json"));
        expect(console.log.calls.count()).toEqual(2);
        expect(console.log.calls.argsFor(0)[0]).toEqual( "Validation failed");
        //expect(console.log.calls.argsFor(1)[0]).toBe(jasmine.any(String));
    });

    it('should log error when invalid YAML/YML file', function () {
        validate(path.join(__dirname, "test_assets/files/invalidmapping.yml"));
        expect(console.log.calls.count()).toEqual(2);
        expect(console.log.calls.argsFor(0)[0]).toEqual( "Validation failed");
        expect(console.log.calls.argsFor(1)[0]).toEqual(jasmine.any(String));
    });

    // it('should log error when invalid XML file', function () {

    // });
});