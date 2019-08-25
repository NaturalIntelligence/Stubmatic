var fileUtil = require('.././lib/util/fileutil');
var configBuilder = require(".././lib/configbuilder");

var rewire = require('rewire'),
  sH = rewire(".././lib/strategy_handler");
  rri = sH.__get__("roundRobinIndex");

describe("Strategy Handler", function () {
  var matchedEntry = {
    index: 2,
    request: {
      matches: {
        url: ["", "url1", "url2"],
        query: ["", "q1", "q2"],
        post: ["", "p1", "p2"]
      }
    },
    response: {
      files: ["file{{ url.1 }}.txt", "file{{ query.1 }}.txt", "file{{ post.1 }}.txt"]
    }
  };

  beforeEach(function () {
    spyOn(configBuilder, "getConfig").and.returnValue({
      stubs: "stubs"
    });
  });

  it("init", function () {
    sH.__set__("roundRobinIndex",[]);
  });

  it("should return file.txt", function () {
    matchedEntry.response.file = "file.txt";

    var result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/file.txt");

    delete matchedEntry.response.file;
  });

  it("should select first file", function () {
    spyOn(fileUtil, "isExist").and.returnValues(true, true, true);
    matchedEntry.response.strategy = "first-found";

    var result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileurl1.txt");
  });

  it("should select second file", function () {
    spyOn(fileUtil, "isExist").and.returnValues(false, true, true);
    matchedEntry.response.strategy = "first-found";

    var result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileq1.txt");
  });

  it("should select files in round-robin fashion", function () {
    sH.__set__("roundRobinIndex",[]);
    spyOn(fileUtil, "isExist").and.returnValues(true, true, false);
    matchedEntry.response.strategy = "round-robin";

    var result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileurl1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileq1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/filep1.txt");

    result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileurl1.txt");

  });

  it("should select files in round-robin fashion and next file when it doesn't exist", function () {
    sH.__set__("roundRobinIndex",[]);
    spyOn(fileUtil, "isExist").and.returnValues(true, true, false,true, true, false);
    matchedEntry.response.strategy = ["round-robin", "first-found"];

    var result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileurl1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileq1.txt");

    result = sH.getFileName(matchedEntry);
    expect(result).toBe("stubs/fileurl1.txt");

  });

  it("should select files in round-robin fashion and next file when it doesn't exist", function () {
    sH.__set__("roundRobinIndex",[]);
    spyOn(fileUtil, "isExist").and.returnValues(false, false, false,false, false, false);
    matchedEntry.response.strategy = ["round-robin", "first-found"];

    var result = sH.getFileName(matchedEntry);
    expect(result).toBe(undefined);
    
  });

  it("should select random file", function () {
    sH.__set__("roundRobinIndex",[]);
    spyOn(fileUtil, "isExist").and.returnValues(true, false, true);
    matchedEntry.response.strategy = "random";

    var result = sH.getFileName(matchedEntry);
    expect(result).toMatch("stubs/fileq1.txt|stubs/fileurl1.txt|stubs/filep1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toMatch("stubs/fileq1.txt|stubs/fileurl1.txt|stubs/filep1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toMatch("stubs/fileq1.txt|stubs/fileurl1.txt|stubs/filep1.txt");
    
  });

   it("should select random file which exist", function () {
    sH.__set__("roundRobinIndex",[]);
    spyOn(fileUtil, "isExist").and.returnValues(true, false, true,true, false, true,true, false, true);
    matchedEntry.response.strategy = [ "random" , "first-found"];

    var result = sH.getFileName(matchedEntry);
    expect(result).toMatch("stubs/fileq1.txt|stubs/fileurl1.txt|stubs/filep1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toMatch("stubs/fileq1.txt|stubs/fileurl1.txt|stubs/filep1.txt");
    
    result = sH.getFileName(matchedEntry);
    expect(result).toMatch("stubs/fileq1.txt|stubs/fileurl1.txt|stubs/filep1.txt");
    
  });


  it("teardown", function () {
    sH.__set__("roundRobinIndex",rri);
  });

});