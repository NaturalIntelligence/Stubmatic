var config = require(".././lib/configbuilder");

const parserFactory = require("../lib/responseParsers/parserFactory");

describe("parser ", function() {

    var options = [];
    options['-d'] = "spec/test_assets";
    config.build(options);

    const jsonStr = '{ "string" : "string" , "boolean" : true, "date" : "Monday March 03 3 2017, 23:45:23"}';

    it("factory should return plain parser", function() {
        const parser = parserFactory.getParser("other");

        const jsonData = parser.parse(jsonStr);
        expect(jsonData.length).toEqual(86);
    });

    it("should parse json into nimn", function() {
        const parser = parserFactory.getParser("jsonToNimn", {
            schema : "/schema/sample.json"
        });

        const nimnData = parser.parse(jsonStr);
        expect(nimnData.length).toEqual(40);
    });

    it("should parse json into nimn with date but without boolean", function() {
        const parser = parserFactory.getParser("jsonToNimn", {
            schema : "/schema/sample.json",
            parseDate : true,
            parseBoolean : false
        });

        const nimnData = parser.parse(jsonStr);
        expect(nimnData.length).toEqual(23);
    });

    it("should parse json into msgcode", function() {
        const parser = parserFactory.getParser("jsonToMsgpack");
       
        const msgpackData = parser.parse(jsonStr);

        expect(msgpackData.length).toEqual(63);
    });
});